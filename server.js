const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db'); 

const app = express();
const port = process.env.PORT || 3000; 

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static('public')); 


app.get('/api/exhibits', async (req, res) => {
  try {
    const client = await pool.connect(); 
    const sql = 'SELECT * FROM exhibit_data ORDER BY created_at DESC';
    
    const result = await client.query(sql); 
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('데이터 조회 실패 (PostgreSQL):', err);
    res.status(500).send('DB 오류 (PostgreSQL)');
  }
});


app.post('/api/exhibits', async (req, res) => {
  const data = req.body;
  const {
    영업팀,
    sr_name,
    매장명,
    '제품 모델명': 제품_모델명,
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


  const sql = `INSERT INTO exhibit_data
    ("영업팀", "sr_name", "매장명", "제품 모델명", "구분", "타입", "최초전시일", "구성품", "색상", "제품상태", "제품이상_메모", "정상가격", "images")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id`; 

  const params = [
    영업팀,
    sr_name,
    매장명,
    제품_모델명, 
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
    const client = await pool.connect(); 
    const result = await client.query(sql, params); 
    client.release(); 
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('데이터 저장 실패 (PostgreSQL):', err);
    res.status(500).json({ success: false, error: 'DB 저장 오류 (PostgreSQL)' });
  }
});


app.listen(port, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});