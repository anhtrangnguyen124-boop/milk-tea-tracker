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
          { role: 'system', content: '你是一位谨慎且实用的旅行攻略助手。根据目的地、日期和同行人，生成一份可编辑的旅行攻略包。每一天都按普通游客可支配的一整天安排，优先选择彼此距离近、换乘少、步行友好、同一片区可串联的景点；抵达日与返程日按实际可用时间降低密度，并为排队、拍照、休息和天气变化留出余量。不得将开放时间、票价、交通班次、预订状态、精确地址作为已核实事实；需要确认的内容必须写进注意事项。只输出合法 JSON，不能有 Markdown。格式必须为：{"title":"","destination":"","startDate":"YYYY-MM-DD或空字符串","endDate":"YYYY-MM-DD或空字符串","dayCount":0,"companions":"","packingList":["证件：身份证、学生证等","衣物：按当地天气准备","出行：充电宝、纸巾等"],"itinerary":[{"day":1,"date":"YYYY-MM-DD或空字符串","title":"抵达与西湖初体验","route":"抵达 → 断桥残雪 → 白堤 → 平湖秋月 → 湖滨商圈","food":["当地小吃：定胜糕、葱包桧","本地菜：杭帮菜或面馆","当地饮品：龙井茶饮或桂花风味饮品"],"description":"以西湖东北线为主，景点相邻且可步行串联；途中可根据体力删减一至两个停留点。"}],"notes":["出发前核验景点预约、开放安排及天气。","热门餐厅和交通请预留排队或候补时间。"]}。必须同时生成三个板块：行李清单、每日行程与路线美食、注意事项。每日 itinerary 只能是一条弹性路线，不得拆成上午／下午／晚上；route 必须用“→”串联 3 至 6 个地点或节点，description 用一句自然语言说明为何顺路、当天大概时间安排与可删减处。food 必须直接放在对应 itinerary 当天，给出 2 至 4 项路线附近的当地小吃／本地菜／特色饮品，其中尽量有一项当地特色饮品、茶饮或咖啡；不编造餐厅实时营业、排队或精确地址。packingList 要结合目的地、季节和出行天数，输出 6 至 12 条可勾选物品。若未给日期，基于合理的 3 天示例并在 notes 说明可调整；若给了日期，dayCount 与 itinerary 天数必须一致。' },
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
