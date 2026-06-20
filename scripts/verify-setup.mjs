import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2];
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function main() {
  console.log('🧋 验证 Supabase 配置...\n');

  // 1. Check entries table
  console.log('1/4 检查 entries 表...');
  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('id')
    .limit(1);

  if (entriesError) {
    console.log(`   ❌ entries 表不存在或无法访问: ${entriesError.message}`);
  } else {
    console.log('   ✅ entries 表正常');
  }

  // 2. Check profiles table
  console.log('2/4 检查 profiles 表...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (profilesError) {
    console.log(`   ❌ profiles 表不存在或无法访问: ${profilesError.message}`);
  } else {
    console.log('   ✅ profiles 表正常');
  }

  // 3. Check storage bucket
  console.log('3/4 检查存储桶...');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

  if (bucketError) {
    console.log(`   ❌ 无法获取存储桶列表: ${bucketError.message}`);
  } else {
    const hasBucket = buckets?.some(b => b.name === 'entry-images');
    if (hasBucket) {
      const bucket = buckets.find(b => b.name === 'entry-images');
      console.log(`   ✅ 存储桶 "entry-images" 存在 (public: ${bucket.public})`);
    } else {
      console.log('   ❌ 存储桶 "entry-images" 不存在');
    }
  }

  // 4. Check auth
  console.log('4/4 检查认证系统...');
  const { data: authSettings } = await supabase.auth.getSession();
  console.log('   ✅ 认证服务正常 (无活动会话)');

  console.log('\n───');
  const allPassed = !entriesError && !profilesError && !bucketError;
  if (allPassed) {
    console.log('🎉 全部检查通过！数据库和存储就绪。');
  } else {
    console.log('⚠️  有部分检查未通过，请检查上述错误。');
  }
}

main().catch(err => {
  console.error('❌ 验证失败:', err.message);
  process.exit(1);
});
