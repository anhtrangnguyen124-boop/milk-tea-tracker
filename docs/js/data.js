// data.js — reference copy from index.html

/* ============================================================
   Data Layer — Milk Tea
   ============================================================ */
const DB = 'milktea_v10';
function ld() { try { return JSON.parse(localStorage.getItem(userKey(DB)) || '[]'); } catch (e) { return []; } }
function sv(a) {
  try { localStorage.setItem(userKey(DB), JSON.stringify(a)); }
  catch (e) { console.error('[SV] localStorage 写入失败:', e.message); toast('存储空间不足，请删除旧记录或压缩图片', 'warn'); }
}
function localDateStr(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
let entries = ld(),
  selDate = localDateStr(),
  calY = new Date().getFullYear(),
  calM = new Date().getMonth(),
  editId = null,
  modalR = 0,
  modalTheme = 'orange',
  pendingImgs = [],
  pendingUploads = 0,
  modalSweetness = '',
  modalIce = '',
  modalToppings = [],
  modalRepurchase = '';

/* ============================================================
   DATA LAYER — Journal
   ============================================================ */
const DB_JOURNAL = 'journal_v1';
function ldJournal() { try { return JSON.parse(localStorage.getItem(userKey(DB_JOURNAL)) || '[]'); } catch (e) { return []; } }
function svJournal(a) {
  try { localStorage.setItem(userKey(DB_JOURNAL), JSON.stringify(a)); }
  catch (e) { console.error('[SV-JOURNAL] localStorage 写入失败:', e.message); toast('存储空间不足', 'warn'); }
}

const MOODS = [
  { key: 'happy', emoji: '😊', label: '开心' },
  { key: 'sad', emoji: '😢', label: '难过' },
  { key: 'anxious', emoji: '😰', label: '焦虑' },
  { key: 'peaceful', emoji: '😌', label: '平静' },
  { key: 'excited', emoji: '🎉', label: '兴奋' },
  { key: 'grateful', emoji: '🙏', label: '感恩' },
  { key: 'inspired', emoji: '💡', label: '灵感' },
  { key: 'thoughtful', emoji: '🤔', label: '思考' },
];
const PAPERS = ['grid', 'lined', 'dot', 'blank'];

let journalEntries = ldJournal();
let journalEditId = null;
let journalMood = 'happy';
let journalCustomMood = '';
let journalPaper = 'grid';
