function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!process.env.DEEPSEEK_API_KEY) return json(res, 503, { error: '服务尚未配置 DEEPSEEK_API_KEY' });

  const request = req.body || {};
  const destination = typeof request.destination === 'string' ? request.destination.trim() : '';
  if (!destination) return json(res, 400, { error: '请先填写目的地' });
  const startDate = typeof request.startDate === 'string' ? request.startDate : '';
  const endDate = typeof request.endDate === 'string' ? request.endDate : '';
  const context = {
    destination,
    startDate,
    endDate,
    companions: typeof request.companions === 'string' ? request.companions.trim() : ''
  };

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        temperature: 0.45,
        max_tokens: 8000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: '你是一位谨慎且实用的旅行攻略助手。根据目的地、日期和同行人，生成一份可编辑的旅行攻略包。每一天都按普通游客可支配的一整天安排，优先选择彼此距离近、换乘少、步行友好、同一片区可串联的景点；抵达日与返程日按实际可用时间降低密度，并为排队、拍照、休息和天气变化留出余量。不得将开放时间、票价、交通班次、预订状态或未经检索的完整门牌地址作为事实；需要确认的内容必须写进注意事项。只输出合法 JSON，不能有 Markdown。格式必须为：{"title":"","destination":"","startDate":"YYYY-MM-DD或空字符串","endDate":"YYYY-MM-DD或空字符串","dayCount":0,"companions":"","recommendations":{"stay":"推荐住在……，说明如何方便串联本次路线。","transport":"说明到达方式与市内主要出行方式。"},"packingList":["证件：身份证及学生证、老年证等适用优惠证件","衣物：适合当地天气的外套","护肤：防晒霜","电子：手机充电线与充电宝","其他：纸巾与湿巾","其他：常用药（肠胃药、感冒药、创可贴等）"],"itinerary":[{"day":1,"date":"YYYY-MM-DD或空字符串","title":"抵达与西湖初体验","route":"抵达 → 断桥残雪 → 白堤 → 平湖秋月 → 湖滨商圈","food":{"meals":[{"name":"片儿川","shop":"店铺名称或空字符串","area":"湖滨/西湖附近","searchQuery":"杭州 片儿川 店铺名称"}],"snacks":[{"name":"定胜糕","shop":"店铺名称或空字符串","area":"河坊街附近","searchQuery":"杭州 定胜糕 店铺名称"}],"drinks":[{"name":"龙井茶饮","shop":"店铺名称或空字符串","area":"西湖附近","searchQuery":"杭州 龙井茶饮 店铺名称"}]},"description":"以西湖东北线为主，景点相邻且可步行串联；途中可根据体力删减一至两个停留点。"}],"notes":["出发前核验景点预约、开放安排及天气。","热门餐厅和交通请预留排队或候补时间。"]}。必须同时生成四个板块：住宿与出行推荐、行李清单、每日行程与路线美食、注意事项。recommendations 必须严格只含两个字段：stay 只说明推荐住在哪里及原因；transport 只说明到达方式与市内出行方式。每日 itinerary 只能是一条弹性路线，不得拆成上午／下午／晚上；route 必须用“→”串联 3 至 6 个地点或节点，description 用一句自然语言说明为何顺路、当天大概时间安排与可删减处。food 必须直接放在对应 itinerary 当天，并严格含 meals、snacks、drinks 三类，每类输出 4 至 6 个对象，分别代表正餐／本地菜、小吃／甜点、当地特色饮品／茶饮／咖啡。每个对象必须含 name、shop、area、searchQuery：name 是美食名称；shop 只填写你有把握的真实店铺名，不确定时必须为空，严禁编造；area 只写路线附近的商圈、街区或景点片区，不写未经核验的门牌号；searchQuery 要包含城市、美食和店铺名，方便后续地图检索。优先推荐路线附近且具有当地特色的丰富选项，避免每天重复。不得声称店铺营业中、排队较少。packingList 必须结合目的地气候与海拔、出行季节、旅行天数、交通方式和同行人，输出 18 至 28 条具体、可直接勾选的物品，每个数组元素只写一个物品或一组必须一起携带的配套物品，不得使用 Markdown 复选框。必须覆盖且严格使用以下五种前缀：证件、衣物、护肤、电子、其他。证件至少包含身份证及适用的学生证、老年证等优惠证件；衣物应按天气给出外套、换洗上衣、内衣袜子、帽子、防晒或保暖用品及合适鞋履；护肤至少考虑防晒、保湿和润唇；电子至少考虑手机充电线、充电宝、耳机，并根据旅行场景决定是否加入相机、电池、相机充电器和自拍架；其他至少考虑纸巾、湿巾、拖鞋、洗漱用品、雨具、水杯以及常用药，并根据目的地补充高原、海边、寒冷、炎热或亲子等专项用品。避免重复和无关用品，不要把“等”“按需准备”单独作为项目。若未给日期，基于合理的 3 天示例并在 notes 说明可调整；若给了日期，dayCount 与 itinerary 天数必须一致。' },
          { role: 'user', content: JSON.stringify(context) }
        ]
      })
    });
    const payload = await response.json();
    if (!response.ok) return json(res, response.status, { error: payload?.error?.message || 'AI 规划失败' });
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) return json(res, 502, { error: 'AI 未返回规划结果' });
    const data = JSON.parse(content);
    if (!data || !Array.isArray(data.itinerary) || !Array.isArray(data.packingList) || !Array.isArray(data.notes)) return json(res, 502, { error: 'AI 返回的规划结构不完整，请重试' });
    return json(res, 200, { data });
  } catch (error) {
    console.error('plan-travel error', error);
    return json(res, 500, { error: 'AI 规划服务暂时不可用' });
  }
};
