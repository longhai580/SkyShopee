require('../utils/MongooseUtil');
const mongoose = require('mongoose');
const Models = require('./Models');
const Db = require('../utils/Db');
const Mem = require('../utils/MemoryStore');

const OrderDAO = {
  async insert(order) {
    if (await Db.useMemory()) return Mem.order.insert(order);
    order._id = new mongoose.Types.ObjectId();
    return Models.Order.create(order);
  },
  async selectByCustID(_cid) {
    if (await Db.useMemory()) return Mem.order.selectByCustID(_cid);
    if (!mongoose.isValidObjectId(_cid)) return [];
    return Models.Order.find({ 'customer._id': _cid }).sort({ cdate: -1 }).exec();
  },
  async selectAll() {
    if (await Db.useMemory()) return Mem.order.selectAll();
    return Models.Order.find({}).sort({ cdate: -1 }).exec();
  },
  async selectByID(_id) {
    if (await Db.useMemory()) return Mem.order.selectByID(_id);
    if (!mongoose.isValidObjectId(_id)) return null;
    return Models.Order.findById(_id).exec();
  },
  async update(_id, newStatus) {
    if (await Db.useMemory()) return Mem.order.update(_id, newStatus);
    return Models.Order.findByIdAndUpdate(_id, { status: newStatus }, { new: true });
  }
};
module.exports = OrderDAO;
