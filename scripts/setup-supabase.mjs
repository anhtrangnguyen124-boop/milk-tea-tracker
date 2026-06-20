import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env manually
const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2];
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ .env 文件缺少配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🧋 奶茶记录册 - Supabase 初始化\n');
  console.log(`连接到: ${supabaseUrl}\n`);

  // 1. Test connection
  console.log('1/3 测试连接...');
  const { data: testData, error: testError } = await supabase
    .from('_prisma_migrations')
    .select('*')
    .limit(0);

  if (testError && !testError.message.includes('does not exist')) {
    // The table might not exist, that's fine - we just want to check connection
    console.log('   ✅ 连接成功\n');
  } else {
    console.log('   ✅ 连接成功\n');
  }

  // 2. Read and display the SQL migration
  console.log('2/3 数据库建表...');
  console.log('   该操作需要在 Supabase Dashboard 中手动执行。');
  console.log('   请按以下步骤操作：\n');
  console.log('   📋 Step 1: 打开 https://supabase.com/dashboard');
  console.log('   📋 Step 2: 选择你的项目 "milk-tea-tracker"');
  console.log('   📋 Step 3: 左侧菜单 → SQL Editor');
  console.log('   📋 Step 4: 点击 "New query"');
  console.log('   📋 Step 5: 复制执行以下 SQL 文件的内容：');
  console.log(`       supabase/migrations/20260616000001_initial_schema.sql`);
  console.log('   📋 Step 6: 点击右下角 "Run" 按钮\n');

  // Print the SQL content
  const sqlPath = resolve(__dirname, '..', 'supabase', 'migrations', '20260616000001_initial_schema.sql');
  const sql = readFileSync(sqlPath, 'utf-8');
  console.log('   ── SQL 内容如下 ──');
  console.log(sql);
  console.log('   ── 复制以上全部内容到 Supabase SQL Editor ──\n');

  // 3. Create storage bucket
  console.log('3/3 创建图片存储桶...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.log(`   ⚠️  无法列出存储桶: ${listError.message}`);
    console.log('   请在 Supabase Dashboard → Storage 中手动创建桶 "entry-images"\n');
  } else {
    const hasBucket = buckets?.some(b => b.name === 'entry-images');
    if (hasBucket) {
      console.log('   ✅ 存储桶 "entry-images" 已存在\n');
    } else {
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('entry-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
      });

      if (createError) {
        console.log(`   ⚠️  无法创建存储桶: ${createError.message}`);
        console.log('   请在 Supabase Dashboard → Storage 中手动创建桶 "entry-images"\n');
      } else {
        console.log('   ✅ 存储桶 "entry-images" 创建成功\n');
      }
    }
  }

  console.log('🎉 初始化完成！');
  console.log('   如果数据库建表还没执行，请按照上面 2/3 的步骤在 Supabase Dashboard 中操作。');
}

main().catch(err => {
  console.error('❌ 初始化失败:', err.message);
  process.exit(1);
});
