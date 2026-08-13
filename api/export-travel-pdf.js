const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

const SUPABASE_URL = 'https://xcwbflsfuxnlwcupnaiy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ4Y3diZmxzZnV4bmx3Y3VwbmFpeSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg1MzgzMjkyLCJleHAiOjIxMDA5NTkyOTJ9.sAHZBcKSVD7JCPLCgcyikoaFIjiHNqGFAv3GJ_FaXSg';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function safeText(value, fallback = '') { return typeof value === 'string' ? value.trim() : fallback; }
function cleanLines(value) { return String(value || '').split(/\r?\n/).map(line => line.replace(/^□\s*/, '').trim()).filter(Boolean); }
function splitSentences(value) { return String(value || '').split(/[；;。]/).map(line => line.trim()).filter(Boolean); }
function fileName(value) { return (safeText(value, '旅行攻略').replace(/[\\/:*?"<>|]/g, '-') || '旅行攻略') + '.pdf'; }

async function getUser(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const response = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: { Authorization: 'Bearer ' + token, apikey: SUPABASE_ANON_KEY } });
  return response.ok ? response.json() : null;
}

function normalizeEntry(input) {
  const entry = input && typeof input === 'object' ? input : {};
  const recommendations = cleanLines(entry.recommendations);
  let stay = recommendations.filter(line => /^住宿[：:]/.test(line)).map(line => line.replace(/^住宿[：:]\s*/, '')).join('；');
  let transport = recommendations.filter(line => /^出行[：:]/.test(line)).map(line => line.replace(/^出行[：:]\s*/, '')).join('；');
  if (!stay) stay = (recommendations[0] || '结合每日路线选择交通便利、餐饮方便的住宿区域。').replace(/^(?:住宿|推荐住宿区域)[：:]\s*/, '');
  if (!transport) transport = (recommendations[1] || '结合当日路线选择公共交通、步行或正规网约车。').replace(/^(?:出行|市内出行|抵达建议)[：:]\s*/, '');

  const packing = cleanLines(entry.packing);
  let clothing = packing.filter(item => /衣|鞋|袜|帽|外套|围巾|防晒|保暖/.test(item));
  let otherPacking = packing.filter(item => !clothing.includes(item));
  if (!clothing.length && packing.length) { clothing = packing.slice(0, Math.ceil(packing.length / 2)); otherPacking = packing.slice(clothing.length); }

  const days = cleanLines(entry.itinerary).map((line, index) => {
    const parts = line.split(/[｜|]/).map(part => part.trim()).filter(Boolean);
    const rawTitle = parts.shift() || `Day ${index + 1}`;
    const routeText = parts.shift() || '';
    const foodText = parts.join('｜').replace(/^沿线美食\s*\/\s*饮品\s*[:：]?\s*/, '');
    const foods = { meals: [], snacks: [], drinks: [] };
    foodText.split(/[；;]/).forEach(item => {
      const match = item.match(/^\s*(正餐|小吃|饮品)[：:](.*)$/);
      if (!match) { if (item.trim()) foods.meals.push(...item.split(/[、，,]/).map(value => value.trim()).filter(Boolean)); return; }
      const key = match[1] === '正餐' ? 'meals' : match[1] === '小吃' ? 'snacks' : 'drinks';
      foods[key].push(...match[2].split(/[、，,]/).map(value => value.trim()).filter(Boolean));
    });
    const route = routeText.split(/\s*(?:→|->|—|－)\s*/).map(value => value.trim()).filter(Boolean).slice(0, 7);
    return { number: index + 1, title: rawTitle.replace(/^Day\s*\d+\s*/i, '').trim() || `第 ${index + 1} 天`, route: route.length ? route : ['酒店', '按当日安排游览', '返回住宿'], foods };
  });

  return {
    title: safeText(entry.title, '旅行攻略'), destination: safeText(entry.destination, '目的地待定'),
    dateText: [safeText(entry.start), safeText(entry.end)].filter(Boolean).join(' - ') || '日期待定',
    stay: splitSentences(stay), transport: splitSentences(transport),
    clothing: clothing.length ? clothing : ['按当地天气准备衣物'],
    otherPacking: otherPacking.length ? otherPacking : ['身份证 / 手机 / 充电器'],
    days: days.length ? days : [{ number: 1, title: '当日行程', route: ['酒店', '目的地', '返回住宿'], foods: { meals: [], snacks: [], drinks: [] } }],
    notes: cleanLines(entry.notes)
  };
}

function list(items) { return items.map(item => `<li>${escapeHtml(item)}</li>`).join(''); }
function checklist(items) { return items.map(item => `<li><span class="check"></span>${escapeHtml(item)}</li>`).join(''); }
function sectionTitle(number, title, continuation = false) { return `<div class="section-title"><span>${String(number).padStart(2, '0')}</span><h2>${escapeHtml(title)}${continuation ? '（续）' : ''}</h2><i></i></div>`; }

function dayCard(day) {
  const route = day.route.map((node, index) => `<span class="route-node"><i></i><b>${escapeHtml(node)}</b></span>${index < day.route.length - 1 ? '<span class="route-line"></span>' : ''}`).join('');
  const schedule = day.route.map((node, index) => `<li><i></i><time>${String(index + 1).padStart(2, '0')}</time><span>${escapeHtml(node)}</span></li>`).join('');
  const foodCard = (label, items, className) => `<div class="food ${className}"><b>${label}</b><p>${escapeHtml((items.length ? items : ['沿线灵活挑选']).join('、'))}</p></div>`;
  return `<article class="day-card"><header><b>Day ${String(day.number).padStart(2, '0')}</b><h3>${escapeHtml(day.title)}</h3></header><div class="day-content"><ol class="timeline">${schedule}</ol><div class="day-right"><div class="route"><strong>推荐路线 <small>（顺路串联）</small></strong><div>${route}</div></div><div class="foods">${foodCard('正餐', day.foods.meals, 'meal')}${foodCard('小吃', day.foods.snacks, 'snack')}${foodCard('饮品', day.foods.drinks, 'drink')}</div></div></div></article>`;
}

function buildHtml(entry) {
  const noteDefaults = [['天气变化', '出发前查看天气，预留衣物与雨具。'], ['防晒保湿', '户外活动注意补水与防晒。'], ['饮食注意', '尊重当地饮食文化与习惯。'], ['财物安全', '证件与贵重物品随身保管。'], ['应急准备', '保存酒店与紧急联系人。']];
  const notes = noteDefaults.map((item, index) => `<article><b>${escapeHtml(item[0])}</b><p>${escapeHtml(entry.notes[index] || item[1])}</p></article>`).join('');
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
  @page{size:A4;margin:10mm 11mm 11mm}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fffdf8;color:#35372f;font-family:"Noto Sans CJK SC","Source Han Sans SC","Microsoft YaHei",sans-serif;font-size:9pt;line-height:1.42;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{width:100%}.masthead{text-align:center;padding:2mm 0 5mm;break-inside:avoid}.eyebrow{display:flex;align-items:center;justify-content:center;gap:4mm;color:#657454;font-size:7pt;letter-spacing:2.6px;font-weight:700}.eyebrow:before,.eyebrow:after{content:"";width:14mm;border-top:1px solid #d9ab9e}.masthead h1{margin:3mm 0 2.5mm;font-family:"Noto Serif CJK SC","Source Han Serif SC","Songti SC",serif;font-size:31pt;line-height:1.05;letter-spacing:2px;color:#2f3526}.meta{display:flex;justify-content:center;gap:3mm}.meta span{padding:1.2mm 4mm;border-radius:99px;font-size:8.5pt;font-weight:600}.place{background:#edf0e6;color:#59634b}.date{background:#fde8e3;color:#ad5c53}.pdf-group{break-inside:avoid;margin:0 0 3mm}.section-title{height:9mm;display:flex;align-items:center;gap:3mm;margin:0 0 1.8mm}.section-title>span{font:22pt/1 Georgia,serif;color:#c76c68}.section-title h2{margin:0;font-family:"Noto Serif CJK SC","Songti SC",serif;font-size:14pt;font-weight:600;white-space:nowrap}.section-title i{flex:1;border-top:1px dashed #dfa39a}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:5mm}.info{min-height:39mm;padding:3.5mm 5mm;border:1px solid;border-radius:4mm}.stay{border-color:#efb5ab;background:linear-gradient(135deg,#fff8f4,#fffdfa)}.move{border-color:#b8c4a6;background:linear-gradient(135deg,#f9faf4,#fffdfa)}.info h3{margin:0 0 2.5mm;padding:0 0 1.5mm;border-bottom:1px solid;font-family:"Noto Serif CJK SC","Songti SC",serif;font-size:15pt}.stay h3{color:#bd6d66;border-color:#efc4bd}.move h3{color:#768660;border-color:#cbd4bf}.info ul{margin:0;padding-left:5mm}.info li{margin:1mm 0}.packing{display:grid;grid-template-columns:1fr 1fr;border:1px solid #bbc6a9;border-radius:4mm;overflow:hidden}.packing>div{padding:2.5mm 5mm}.packing>div+div{border-left:1px dashed #bdc5ad}.packing h3{display:inline-block;margin:0 0 1.5mm;padding:.7mm 4mm;border-radius:99px;background:#80906c;color:white;font-size:8pt}.packing ul{margin:0;padding:0;list-style:none}.packing li{display:flex;gap:2mm;align-items:flex-start;margin:.9mm 0}.check{width:3mm;height:3mm;margin-top:.5mm;border:1px solid #62675b;flex:0 0 auto}.day-card{break-inside:avoid;margin:0 0 3mm;padding:0 3mm 3mm;border:1px solid #abc7e5;border-radius:4mm}.day-card header{display:flex;align-items:center;gap:3mm;padding:0 0 1.5mm}.day-card header>b{padding:1.2mm 3mm;border-radius:0 0 3mm 3mm;background:#4d80b6;color:white;font-size:10pt}.day-card h3{margin:0;color:#4678a9;font-size:10pt}.day-content{display:grid;grid-template-columns:45% 55%;gap:3mm}.timeline{position:relative;margin:0;padding:1mm 0 1mm 7mm;list-style:none;border-left:1px solid #83acd6}.timeline li{position:relative;display:grid;grid-template-columns:9mm 1fr;min-height:5.8mm}.timeline li>i{position:absolute;left:-2mm;top:1mm;width:3mm;height:3mm;border:1px solid #3d79b4;border-radius:50%;background:white}.timeline time{color:#3e78b1}.timeline span{color:#48463f}.day-right{display:flex;flex-direction:column;gap:2mm}.route{padding:2mm 3mm;border:1px solid #bad1e8;border-radius:3mm;background:#fbfdff;color:#4f7eae}.route strong{font-size:8pt}.route small{font-weight:400}.route>div{display:flex;align-items:flex-start;margin-top:3mm}.route-node{display:flex;flex:0 1 18mm;min-width:0;flex-direction:column;align-items:center;text-align:center}.route-node i{width:3.5mm;height:3.5mm;border:1.5px solid #4e83bd;border-radius:50%;background:white}.route-node b{margin-top:1mm;color:#48515a;font-size:6.3pt;line-height:1.25;font-weight:500}.route-line{flex:1;margin-top:1.7mm;border-top:1px dashed #4f83bc}.foods{display:grid;grid-template-columns:repeat(3,1fr);gap:2mm}.food{min-height:20mm;padding:2mm 2.5mm;border:1px solid;border-radius:3mm}.food b{display:block;margin-bottom:1mm;font-size:9pt}.food p{margin:0;font-size:7.6pt;line-height:1.4}.meal{border-color:#c8d8ea;background:#f4f8fe;color:#4779ac}.snack{border-color:#ecd4a0;background:#fff9ed;color:#b18839}.drink{border-color:#bed1b4;background:#f6faf3;color:#728b67}.notes{display:grid;grid-template-columns:repeat(5,1fr);gap:2mm}.notes article{min-height:27mm;padding:2.5mm;border:1px solid #ebcf8d;border-radius:3mm;background:#fff9ec}.notes b{color:#805e20;font-size:9pt}.notes p{margin:1.2mm 0 0;font-size:7.4pt;line-height:1.4}.continuation{break-before:page}.continuation .section-title{margin-top:0}
  </style></head><body><header class="masthead"><div class="eyebrow">LIFE ARCHIVE · TRAVEL PLAN</div><h1>${escapeHtml(entry.title)}</h1><div class="meta"><span class="place">●&nbsp; ${escapeHtml(entry.destination)}</span><span class="date">▣&nbsp; ${escapeHtml(entry.dateText)}</span></div></header><section class="pdf-group">${sectionTitle(1, '住宿 & 出行')}<div class="info-grid"><article class="info stay"><h3>住宿</h3><ul>${list(entry.stay)}</ul></article><article class="info move"><h3>出行</h3><ul>${list(entry.transport)}</ul></article></div></section><section class="pdf-group">${sectionTitle(2, '出行行李清单')}<div class="packing"><div><h3>衣物类</h3><ul>${checklist(entry.clothing)}</ul></div><div><h3>其他类</h3><ul>${checklist(entry.otherPacking)}</ul></div></div></section><section>${sectionTitle(3, '每日行程与路线美食')}${entry.days.map(dayCard).join('')}</section><section class="pdf-group">${sectionTitle(4, '出行注意事项')}<div class="notes">${notes}</div></section></body></html>`;
}

async function executablePath() {
  if (process.env.CHROME_EXECUTABLE_PATH) return process.env.CHROME_EXECUTABLE_PATH;
  if (process.platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  return chromium.executablePath();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await getUser(req).catch(() => null);
  if (!user || !user.email) return res.status(401).json({ error: '登录状态无效，请重新登录' });
  const entry = normalizeEntry(req.body?.entry);
  if (!entry.title || !entry.destination) return res.status(400).json({ error: '旅行攻略内容不完整' });

  let browser;
  try {
    browser = await puppeteer.launch({ args: process.platform === 'darwin' ? ['--no-sandbox'] : chromium.args, defaultViewport: { width: 1240, height: 1754 }, executablePath: await executablePath(), headless: true });
    const page = await browser.newPage();
    await page.setContent(buildHtml(entry), { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    const pdf = await page.pdf({ format: 'A4', printBackground: true, displayHeaderFooter: false, preferCSSPageSize: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName(entry.title))}`);
    res.setHeader('Cache-Control', 'no-store');
    return res.send(Buffer.from(pdf));
  } catch (error) {
    console.error('export-travel-pdf error', error);
    return res.status(500).json({ error: 'PDF 生成失败，请稍后重试' });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
};

module.exports.buildHtml = buildHtml;
module.exports.normalizeEntry = normalizeEntry;
