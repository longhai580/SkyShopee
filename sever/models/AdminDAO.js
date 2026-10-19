require('../utils/MongooseUtil');
const Models = require('./Models');
const Db = require('../utils/Db');
const Mem = require('../utils/MemoryStore');

const AdminDAO = {
  async selectByUsernameAndPassword(username, password) {
    if (await Db.useMemory()) return Mem.admin.selectByUsernameAndPassword(username, password);
    const query = { username: username, password: password };
    const admin = await Models.Admin.findOne(query);
    return admin;
  }
};
module.exports = AdminDAO;
