//CLI: npm install mongoose --save
const mongoose = require('mongoose');
const MyConstants = require('./MyConstants');
const Db = require('./Db');
const MemoryStore = require('./MemoryStore');

function encodePart(part) {
  // bỏ qua nếu đã được mã hoá sẵn (vd: %40)
  try {
    return encodeURIComponent(decodeURIComponent(part));
  } catch (e) {
    return encodeURIComponent(part);
  }
}

function normalizeMongoUri(uri) {
  // Mật khẩu có ký tự đặc biệt (vd: 123456aZ@) phải được mã hoá (@ -> %40).
  // Host nằm sau dấu '@' cuối cùng, nên tách theo dấu đó.
  const m = uri.trim().match(/^(mongodb(?:\+srv)?:\/\/)(.*)@([^@]*)$/);
  if (!m) return uri.trim();
  const auth = m[2];
  const i = auth.indexOf(':');
  if (i === -1) return m[1] + encodePart(auth) + '@' + m[3];
  return m[1] + encodePart(auth.slice(0, i)) + ':' + encodePart(auth.slice(i + 1)) + '@' + m[3];
}

const RETRY_MS = 60 * 1000;

function useMemory(reason) {
  if (Db.state.mode === 'memory') {
    Db.setMode('memory', reason);
    console.warn('[DB] Vẫn chưa kết nối được MongoDB, sẽ thử lại sau ' + RETRY_MS / 1000 + ' giây.');
    return;
  }
  MemoryStore.init();
  Db.setMode('memory', reason);
  console.warn('\n================ SKYSHOP ================');
  console.warn('[DB] KHÔNG kết nối được MongoDB: ' + (reason && reason.message ? reason.message : reason));
  console.warn('[DB] -> Đang chạy CHẾ ĐỘ DỰ PHÒNG với dữ liệu mẫu trong bộ nhớ.');
  console.warn('[DB]    Website vẫn hiển thị sản phẩm, nhưng dữ liệu sẽ mất khi tắt server.');
  console.warn('[DB] Cách sửa: kiểm tra DB_URI trong sever/.env, và trên MongoDB Atlas');
  console.warn('[DB]    vào Network Access -> Add IP Address -> Allow access from anywhere (0.0.0.0/0).');
  console.warn('=========================================\n');
}

if (!global.__skyshopMongoStarted) {
  global.__skyshopMongoStarted = true;
  mongoose.set('strictQuery', false);

  if (!MyConstants.DB_URI) {
    useMemory('Thiếu DB_URI trong file sever/.env');
  } else {
    const uri = normalizeMongoUri(MyConstants.DB_URI);
    const connect = () => mongoose.connect(uri, { dbName: MyConstants.DB_DATABASE, serverSelectionTimeoutMS: 10000 })
      .then(async () => {
        console.log('[DB] Connected to MongoDB/' + MyConstants.DB_DATABASE);
        try {
          const SeedDataUtil = require('./SeedDataUtil');
          await SeedDataUtil.seed();
          console.log('[DB] Sample data is ready for the UI');
        } catch (err) {
          console.error('[DB] Seed error (bỏ qua):', err.message);
        }
        Db.setMode('mongo');
      })
      .catch((err) => {
        useMemory(err);
        // tự thử lại, để sau khi mở IP trên Atlas không cần khởi động lại server
        setTimeout(connect, RETRY_MS);
      });
    connect();
  }
}

module.exports = mongoose;
