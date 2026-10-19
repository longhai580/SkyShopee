//CLI: npm install express body-parser --save
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Không để server sập vì một lỗi chưa bắt
process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err && err.message ? err.message : err);
});

// khởi động kết nối DB ngay (sẽ tự chuyển sang dữ liệu dự phòng nếu lỗi)
require('./utils/MongooseUtil');

// middlewares
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// apis
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from server!' });
});
app.use('/api/admin', require('./api/admin.js'));
app.use('/api/customer', require('./api/customer.js'));

// API không tồn tại
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API not found: ' + req.originalUrl });
});
// bắt lỗi chung cho API -> trả JSON thay vì treo request
// eslint-disable-next-line no-unused-vars
app.use('/api', (err, req, res, next) => {
  console.error('[API ERROR]', req.method, req.originalUrl, '-', err.message);
  res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
});

// deployment
// '/admin' serve the files at client-admin/build/* as static files
app.use('/admin', express.static(path.resolve(__dirname, '../client-admin/build')));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client-admin/build', 'index.html'));
});
// '/' serve the files at client-customer/build/* as static files
app.use('/', express.static(path.resolve(__dirname, '../client-customer/build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client-customer/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[SERVER] Cổng ${PORT} đang bị chiếm (có thể do React dev server). Hãy tắt chương trình đó hoặc chạy: PORT=3005 npm start`);
  } else {
    console.error('[SERVER]', err);
  }
  process.exit(1);
});
