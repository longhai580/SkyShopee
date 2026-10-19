//CLI: npm install mongoose --save
const mongoose = require('mongoose');
const MyConstants = require('./MyConstants');
const Db = require('./Db');
const MemoryStore = require('./MemoryStore');

function normalizeMongoUri(uri) {
  // Mật khẩu có ký tự '@' (vd: 123456aZ@) phải được mã hoá thành %40
  return uri.replace('@@', '%40@');
}

function useMemory(reason) {
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
    mongoose.connect(uri, { dbName: MyConstants.DB_DATABASE, serverSelectionTimeoutMS: 10000 })
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
      .catch((err) => useMemory(err));
  }
}

module.exports = mongoose;
