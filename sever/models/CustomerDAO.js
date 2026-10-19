require('../utils/MongooseUtil');
const mongoose = require('mongoose');
const Models = require('./Models');
const Db = require('../utils/Db');
const Mem = require('../utils/MemoryStore');

const CustomerDAO = {
  async selectByUsernameOrEmail(username, email) {
    if (await Db.useMemory()) return Mem.customer.selectByUsernameOrEmail(username, email);
    const query = { $or: [{ username: username }, { email: email }] };
    return Models.Customer.findOne(query);
  },
  async insert(customer) {
    if (await Db.useMemory()) return Mem.customer.insert(customer);
    customer._id = new mongoose.Types.ObjectId();
    return Models.Customer.create(customer);
  },
  async active(_id, token, active) {
    if (await Db.useMemory()) return Mem.customer.active(_id, token, active);
    if (!mongoose.isValidObjectId(_id)) return null;
    const query = { _id: _id, token: token };
    return Models.Customer.findOneAndUpdate(query, { active: active }, { new: true });
  },
  async selectByUsernameAndPassword(username, password) {
    if (await Db.useMemory()) return Mem.customer.selectByUsernameAndPassword(username, password);
    return Models.Customer.findOne({ username: username, password: password });
  },
  async update(customer) {
    if (await Db.useMemory()) return Mem.customer.update(customer);
    const newvalues = { username: customer.username, password: customer.password, name: customer.name, phone: customer.phone, email: customer.email };
    return Models.Customer.findByIdAndUpdate(customer._id, newvalues, { new: true });
  },
  async selectAll() {
    if (await Db.useMemory()) return Mem.customer.selectAll();
    return Models.Customer.find({}).exec();
  },
  async selectByID(_id) {
    if (await Db.useMemory()) return Mem.customer.selectByID(_id);
    if (!mongoose.isValidObjectId(_id)) return null;
    return Models.Customer.findById(_id).exec();
  }
};
module.exports = CustomerDAO;
