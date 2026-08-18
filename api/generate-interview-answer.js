function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(body));
}

function text(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max || 12000) : '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!process.env.DEEPSEEK_API_KEY) return json(res, 503, { error: '服务尚未配置 DEEPSEEK_API_KEY' });

  const body = req.body || {};
  const mode = body.mode === 'detailed' ? 'detailed' : 'twoMinute';
  const job = body.job || {}, interview = body.interview || {}, preparation = body.preparation || {}, question = body.question || {};
  const source = {
    company: text(job.company, 200), position: text(job.position, 200), jdContent: text(job.jdContent, 6000),
    interviewName: text(interview.name, 100), interviewMode: text(interview.mode, 100), interviewStatus: text(interview.status, 100),
    preparation: { intro:text(preparation.intro, 4000), internship:text(preparation.internship, 7000), precautions:text(preparation.precautions, 4000), keyQuestions:text(preparation.keyQuestions, 4000), materials:text(preparation.materials, 4000), resourceNotes:Array.isArray(preparation.notes) ? preparation.notes.map((note) => ({ title:text(note && note.title, 300), content:text(note && note.content, 5000) })) : [] },
    question: { title:text(question.title, 1000), tag:text(question.tag, 100), originalQuestion:text(question.originalQuestion, 5000), answer:text(question.answer, 7000), feedback:text(question.feedback, 1000) }
  };
  if (!source.question.title && !source.question.originalQuestion) return json(res, 400, { error: '请先填写题目或面试官原始提问' });

  const modeInstruction = mode === 'twoMinute'
    ? '生成约 150–300 字的中文完整口述段落：核心结论→背景/任务→行动→结果→自然回扣能力。正常语速约 1.5–2 分钟。表达口语化、真实、可直接说出口；不要用 Markdown、机械分点或空泛套话。'
    : '生成中文详细准备版，并使用清晰小标题：回答主线、可展开细节、可补充事实、潜在追问、表达建议。明确哪些信息来自用户材料，哪些必须由用户补充或确认。';
  const system = '你是谨慎的中文求职面试教练。只可使用请求提供的明确事实；严禁虚构项目、职责、数据、技术栈、岗位要求或面试结果。信息不足时，先列出 missingInfo（数组），并在 answer 中使用 [项目名称]、[个人职责]、[量化结果] 等占位符给出可编辑草稿。不得承诺 offer 或通过概率。' + modeInstruction + '仅输出合法 JSON：{"answer":"","missingInfo":[]}。';

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.DEEPSEEK_MODEL || 'deepseek-chat', temperature: 0.35, max_tokens: mode === 'twoMinute' ? 1200 : 2600, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: JSON.stringify(source) }] })
    });
    const payload = await response.json();
    if (!response.ok) return json(res, response.status, { error: payload && payload.error && payload.error.message || 'AI 生成失败' });
    const content = payload && payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
    if (!content) return json(res, 502, { error: 'AI 未返回内容' });
    const data = JSON.parse(content);
    if (!data || typeof data.answer !== 'string') return json(res, 502, { error: 'AI 返回结构不完整，请重试' });
    return json(res, 200, { data: { answer:data.answer, missingInfo:Array.isArray(data.missingInfo) ? data.missingInfo : [], mode } });
  } catch (error) {
    console.error('generate-interview-answer error', error);
    return json(res, 500, { error: 'AI 生成服务暂时不可用' });
  }
};
