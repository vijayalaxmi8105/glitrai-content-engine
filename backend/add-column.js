const pool = require('./db');

async function run() {
  try {
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS product_image_url TEXT;`);
    console.log('✅ product_image_url column added');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

run();