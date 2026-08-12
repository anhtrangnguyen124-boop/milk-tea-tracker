const schema = {
  name: 'travel_archive',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      destination: { type: 'string' },
      startDate: { type: 'string', description: 'YYYY-MM-DD or empty string' },
      endDate: { type: 'string', description: 'YYYY-MM-DD or empty string' },
      dayCount: { type: 'integer', minimum: 0 },
      companions: { type: 'string' },
      logistics: { type: 'array', items: { type: 'string' } },
      itinerary: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            day: { type: 'integer', minimum: 1 },
            date: { type: 'string' },
            title: { type: 'string' },
            activities: { type: 'array', items: { type: 'string' } }
          },
          required: ['day', 'date', 'title', 'activities']
        }
      },
      notes: { type: 'array', items: { type: 'string' } }
    },
    required: ['title', 'destination', 'startDate', 'endDate', 'dayCount', 'companions', 'logistics', 'itinerary', 'notes']
  }
};

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY) return json(res, 503, { error: '服务尚未配置 OPENAI_API_KEY' });

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text) return json(res, 400, { error: '缺少攻略文本' });
  if (text.length > 50000) return json(res, 413, { error: '攻略文本过长，请控制在 5 万字以内' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_schema', json_schema: schema },
        messages: [
          {
            role: 'system',
            content: '你是旅行攻略结构化解析器。仅根据用户提供的攻略提取信息，绝不补造事实。日期统一为 YYYY-MM-DD；无法确认填空字符串。dayCount 表示包含出发日与返程日的自然日数；若只有“X天Y晚”则填写 X。每个 itinerary 项为一天，按原攻略顺序编号。交通、住宿均写入 logistics；预约、预算、注意事项等写入 notes。'
          },
          { role: 'user', content: text }
        ]
      })
    });
    const payload = await response.json();
    if (!response.ok) return json(res, response.status, { error: payload?.error?.message || 'AI 解析失败' });
    const output = payload?.choices?.[0]?.message?.content;
    if (!output) return json(res, 502, { error: 'AI 未返回解析结果' });
    return json(res, 200, { data: JSON.parse(output) });
  } catch (error) {
    console.error('parse-travel error', error);
    return json(res, 500, { error: '解析服务暂时不可用' });
  }
}
