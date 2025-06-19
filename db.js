
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


pool.on('connect', () => {
  console.log('✅ PostgreSQL 연결 성공!');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 오류 발생:', err);
});

module.exports = pool;