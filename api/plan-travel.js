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
    companions: typeof request.companions === 'string' ? request.companions.trim() : '',
    budget: typeof request.budget === 'string' ? request.budget.trim() : '',
    preferences: typeof request.preferences === 'string' ? request.preferences.trim() : '',
    pace: typeof request.pace === 'string' ? request.pace.trim() : '',
    mustSee: typeof request.mustSee === 'string' ? request.mustSee.trim() : ''
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
          { role: 'system', content: '你是一位谨慎的旅行规划助手。只生成可编辑的初版行程，不得声称或编造实时营业时间、票价、交通班次、预订状态和精确地址；这些内容必须提醒用户出行前核验。根据用户给出的目的地、日期、同行人、预算和偏好，规划路线紧凑、同一区域尽量安排在同一天、保留用餐和休息时间。只输出合法 JSON，不能有 Markdown。格式必须为：{"title":"","destination":"","startDate":"YYYY-MM-DD或空字符串","endDate":"YYYY-MM-DD或空字符串","dayCount":0,"companions":"","logistics":["建议住宿区域：...","市内交通建议：..."],"itinerary":[{"day":1,"date":"YYYY-MM-DD或空字符串","title":"当天主题","activities":["上午：...","下午：...","晚上：..."]}],"notes":["出行前核验：...","预算建议：..."]}。如果未给日期，基于合理的 3 天示例并在 notes 说明可调整；如果给了日期，dayCount 和 itinerary 天数必须一致。' },
          { role: 'user', content: JSON.stringify(context) }
        ]
      })
    });
    const payload = await response.json();
    if (!response.ok) return json(res, response.status, { error: payload?.error?.message || 'AI 规划失败' });
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) return json(res, 502, { error: 'AI 未返回规划结果' });
    const data = JSON.parse(content);
    if (!data || !Array.isArray(data.itinerary) || !Array.isArray(data.logistics) || !Array.isArray(data.notes)) return json(res, 502, { error: 'AI 返回的规划结构不完整，请重试' });
    return json(res, 200, { data });
  } catch (error) {
    console.error('plan-travel error', error);
    return json(res, 500, { error: 'AI 规划服务暂时不可用' });
  }
};
