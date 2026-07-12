const fs = require('fs');
const { Pool } = require('pg');

const envContent = fs.readFileSync('.env.neon', 'utf8');
let dbUrl = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].replace(/"/g, '').trim();
  }
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const res = await pool.query('SELECT count(*) FROM "Product" WHERE "deletedAt" IS NULL');
    console.log('Active Products count:', res.rows[0].count);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
main();
