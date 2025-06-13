const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db'); // Ensure 'db' module is correctly set up for database connection

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
// Increased limit for body parser to handle potentially large image data
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static('public')); // Serve static files from the 'public' folder

// 데이터 목록 조회 API (최신순)
app.get('/api/exhibits', (req, res) => {
  // 'created_at' 컬럼이 존재하지 않아 오류가 발생하므로, 정렬 조건을 제거했습니다.
  // 이 오류를 영구적으로 해결하려면 데이터베이스에 'created_at' 컬럼을 추가해야 합니다.
  const sql = 'SELECT * FROM exhibit_data'; // ORDER BY created_at DESC 제거
  db.query(sql, (err, results) => {
    if (err) {
      console.error('데이터 조회 실패:', err);
      return res.status(500).send('DB 오류');
    }
    res.json(results);
  });
});

// 데이터 저장 API
app.post('/api/exhibits', (req, res) => {
  const data = req.body;
  // Destructure `data` object, using an alias for '제품 모델명'
  // JavaScript variable names cannot contain spaces directly.
  // The database column '제품 모델명' is accessed from the 'data' object
  // and assigned to the JavaScript variable '제품_모델명'.
  const {
    영업팀,
    sr_name,
    매장명,
    '제품 모델명': 제품_모델명, // Corrected: Using an alias for destructuring
    구분,
    타입,
    최초전시일,
    구성품,
    색상,
    제품상태,
    제품이상_메모,
    정상가격,
    images
  } = data;

  const imagesStr = JSON.stringify(images || []);

  // Ensure the SQL query uses backticks for column names with spaces
  // And the `제품 모델명` column uses the correct JavaScript variable
  const sql = `INSERT INTO exhibit_data
    (영업팀, sr_name, 매장명, \`제품 모델명\`, 구분, 타입, 최초전시일, 구성품, 색상, 제품상태, 제품이상_메모, 정상가격, images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    영업팀,
    sr_name,
    매장명,
    제품_모델명, // Use the aliased JavaScript variable here
    구분,
    타입,
    최초전시일,
    구성품,
    색상,
    제품상태,
    제품이상_메모,
    정상가격,
    imagesStr
  ];

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('데이터 저장 실패:', err);
      return res.status(500).json({ error: 'DB 저장 오류' });
    }
    res.json({ success: true, id: results.insertId });
  });
});

app.listen(port, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});
