// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',              // → MySQL 사용자
  password: 'dagyo007',       // → 당신이 직접 입력한 비밀번호
  database: 'exhibit_db'     // → 방금 만든 데이터베이스
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL 연결 실패:', err);
    return;
  }
  console.log('✅ MySQL 연결 성공');
});

module.exports = connection;
