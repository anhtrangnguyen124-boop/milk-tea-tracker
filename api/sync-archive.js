const CloudBase = require('@cloudbase/manager-node');

const SUPABASE_URL = 'https://xcwbflsfuxnlwcupnaiy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ4Y3diZmxzZnV4bmx3Y3VwbmFpeSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg1MzgzMjkyLCJleHAiOjIxMDA5NTkyOTJ9.sAHZBcKSVD7JCPLCgcyikoaFIjiHNqGFAv3GJ_FaXSg';
const MODULES = ['cooking_v1', 'foodmap_v1', 'travel_v1', 'milktea_v10', 'journal_v1', 'job_v1', 'job_review_v1'];

function send(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(body));
}

function sqlString(value) { return "'" + String(value).replace(/'/g, "''") + "'"; }

async function getUser(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const response = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { Authorization: 'Bearer ' + token, apikey: SUPABASE_ANON_KEY }
  });
  return response.ok ? response.json() : null;
}

function database() {
  if (!process.env.TENCENTCLOUD_SECRET_ID || !process.env.TENCENTCLOUD_SECRET_KEY || !process.env.CLOUDBASE_ENV_ID) return null;
  return CloudBase.init({
    secretId: process.env.TENCENTCLOUD_SECRET_ID,
    secretKey: process.env.TENCENTCLOUD_SECRET_KEY,
    envId: process.env.CLOUDBASE_ENV_ID
  }).database;
}

async function ensureTable(db) {
  await db.executePGSql({ Sql: 'CREATE TABLE IF NOT EXISTS public.life_archive_snapshots (owner_email text PRIMARY KEY, payload jsonb NOT NULL DEFAULT \'{}\'::jsonb, updated_at timestamptz NOT NULL DEFAULT now())' });
}

function toObjects(result) {
  const columns = result.Columns || [];
  return (result.Rows || []).map(row => {
    const values = JSON.parse(row);
    return columns.reduce((object, column, index) => { object[column] = values[index]; return object; }, {});
  });
}

module.exports = async function handler(req, res) {
  if (!['GET', 'PUT'].includes(req.method)) return send(res, 405, { error: 'Method not allowed' });
  const user = await getUser(req).catch(() => null);
  if (!user || !user.email) return send(res, 401, { error: '登录状态无效，请重新登录' });
  const db = database();
  if (!db) return send(res, 503, { error: '云同步尚未完成配置' });

  try {
    await ensureTable(db);
    if (req.method === 'GET') {
      const result = await db.executePGSql({ Sql: 'SELECT payload, updated_at FROM public.life_archive_snapshots WHERE owner_email = ' + sqlString(user.email) + ' LIMIT 1' });
      const row = toObjects(result)[0];
      return send(res, 200, { found: !!row, payload: row ? (typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload) : null, updatedAt: row?.updated_at || null });
    }

    const payload = req.body?.payload;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return send(res, 400, { error: '同步数据格式不正确' });
    const safePayload = {};
    MODULES.forEach(name => { if (Array.isArray(payload[name])) safePayload[name] = payload[name]; });
    const body = JSON.stringify(safePayload);
    if (Buffer.byteLength(body, 'utf8') > 7 * 1024 * 1024) return send(res, 413, { error: '当前档案含图片过大，暂时无法同步。请减少单张图片尺寸后重试。' });
    await db.executePGSql({ Sql: 'INSERT INTO public.life_archive_snapshots (owner_email, payload, updated_at) VALUES (' + sqlString(user.email) + ', ' + sqlString(body) + '::jsonb, now()) ON CONFLICT (owner_email) DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()' });
    return send(res, 200, { ok: true });
  } catch (error) {
    console.error('sync-archive error', error);
    return send(res, 500, { error: '云同步暂时不可用，请稍后重试' });
  }
};
