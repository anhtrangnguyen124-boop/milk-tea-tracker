function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!process.env.DEEPSEEK_API_KEY) return json(res, 503, { error: '服务尚未配置 DEEPSEEK_API_KEY' });

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text) return json(res, 400, { error: '缺少攻略文本' });
  if (text.length > 50000) return json(res, 413, { error: '攻略文本过长，请控制在 5 万字以内' });

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        temperature: 0,
        max_tokens: 8000,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: '你是旅行攻略结构化解析器。仅根据用户提供的攻略提取信息，绝不补造事实。必须只输出合法 JSON，不能包含 Markdown 或解释。JSON 格式必须为：{"title":"","destination":"","startDate":"YYYY-MM-DD或空字符串","endDate":"YYYY-MM-DD或空字符串","dayCount":0,"companions":"","logistics":[""],"itinerary":[{"day":1,"date":"YYYY-MM-DD或空字符串","title":"","activities":[""]}],"notes":[""]}。dayCount 表示包含出发日与返程日的自然日数；若只有“X天Y晚”则填写 X。每个 itinerary 项为一天，按原攻略顺序编号。交通、住宿均写入 logistics；预约、预算、注意事项等写入 notes。'
          },
          { role: 'user', content: text }
        ]
      })
    });
    const payload = await response.json();
    if (!response.ok) return json(res, response.status, { error: payload?.error?.message || 'AI 解析失败' });
    const output = payload?.choices?.[0]?.message?.content;
    if (!output) return json(res, 502, { error: 'AI 未返回解析结果' });
    const data = JSON.parse(output);
    if (!data || typeof data !== 'object' || !Array.isArray(data.itinerary) || !Array.isArray(data.logistics) || !Array.isArray(data.notes)) {
      return json(res, 502, { error: 'AI 返回的结构不完整，请重试' });
    }
    return json(res, 200, { data });
  } catch (error) {
    console.error('parse-travel error', error);
    return json(res, 500, { error: '解析服务暂时不可用' });
  }
}
