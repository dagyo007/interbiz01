const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db'); // ⭐ db.js에서 Pool 객체를 불러옴 (pg 라이브러리) ⭐

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static('public')); // Serve static files from the 'public' folder

// 데이터 목록 조회 API (최신순)
app.get('/api/exhibits', async (req, res) => { // ⭐ async 추가 ⭐
  try {
    const client = await pool.connect(); // ⭐ pool에서 클라이언트 연결 가져오기 ⭐
    // 'created_at' 컬럼이 NeonDB에 있다면 정렬 조건 유지 가능
    // 없다면 주석 처리하거나 제거 (DBeaver 마이그레이션 시 생성되었을 가능성 높음)
    const sql = 'SELECT * FROM exhibit_data ORDER BY created_at DESC'; // created_at이 있다면 사용
    // const sql = 'SELECT * FROM exhibit_data'; // created_at이 없다면 사용
    const result = await client.query(sql); // ⭐ client.query 사용 ⭐
    client.release(); // ⭐ 사용 후 클라이언트 반환 ⭐
    res.json(result.rows); // ⭐ result.rows 사용 (pg 라이브러리는 rows 속성에 데이터 담음) ⭐
  } catch (err) {
    console.error('데이터 조회 실패 (PostgreSQL):', err); // ⭐ 로그 메시지 변경 ⭐
    res.status(500).send('DB 오류 (PostgreSQL)');
  }
});

// 데이터 저장 API
app.post('/api/exhibits', async (req, res) => { // ⭐ async 추가 ⭐
  const data = req.body;
  const {
    영업팀,
    sr_name,
    매장명,
    '제품 모델명': 제품_모델명, // Destructuring alias for '제품 모델명'
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

  // ⭐ PostgreSQL 문법으로 변경: 큰따옴표(""), 플레이스홀더 ($1, $2, ...) ⭐
  const sql = `INSERT INTO exhibit_data
    ("영업팀", "sr_name", "매장명", "제품 모델명", "구분", "타입", "최초전시일", "구성품", "색상", "제품상태", "제품이상_메모", "정상가격", "images")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id`; // ⭐ 새로 삽입된 ID를 반환받기 위해 RETURNING id 추가 ⭐

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

  try {
    const client = await pool.connect(); // ⭐ pool에서 클라이언트 연결 가져오기 ⭐
    const result = await client.query(sql, params); // ⭐ client.query 사용 ⭐
    client.release(); // ⭐ 사용 후 클라이언트 반환 ⭐
    // ⭐ PostgreSQL에서 삽입된 ID 가져오기: result.rows[0].id ⭐
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('데이터 저장 실패 (PostgreSQL):', err); // ⭐ 로그 메시지 변경 ⭐
    res.status(500).json({ success: false, error: 'DB 저장 오류 (PostgreSQL)' });
  }
});

app.listen(port, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});