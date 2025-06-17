// app.js 또는 server.js
const pool = require('./db'); // 수정된 db.js 파일 import

// 데이터 조회 라우트 예시
app.get('/api/exhibits', async (req, res) => {
  try {
    const client = await pool.connect(); // 풀에서 클라이언트 가져오기
    const result = await client.query('SELECT * FROM exhibit_data');
    res.json(result.rows);
    client.release(); // 사용 후 클라이언트 반환
  } catch (err) {
    console.error('데이터 조회 오류:', err);
    res.status(500).json({ error: '데이터를 불러오는 데 실패했습니다.' });
  }
});

// 데이터 삽입 라우트 예시
app.post('/api/exhibits', async (req, res) => {
  const { /* 폼 데이터 */ } = req.body;
  try {
    const client = await pool.connect();
    // 쿼리 파라미터를 사용하여 SQL 인젝션 방지
    const queryText = `INSERT INTO exhibit_data (영업팀, sr_name, ...) VALUES ($1, $2, ...)`
    const values = [req.body.영업팀, req.body.sr_name, /* ... */];
    await client.query(queryText, values);
    res.json({ success: true });
    client.release();
  } catch (err) {
    console.error('데이터 삽입 오류:', err);
    res.status(500).json({ success: false, error: '저장에 실패했습니다.' });
  }
});