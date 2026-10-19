require('../utils/MongooseUtil');
const mongoose = require('mongoose');
const Models = require('./Models');
const Db = require('../utils/Db');
const Mem = require('../utils/MemoryStore');

const CategoryDAO = {
  async selectAll() {
    if (await Db.useMemory()) return Mem.category.selectAll();
    return Models.Category.find({}).exec();
  },
  async insert(category) {
    if (await Db.useMemory()) return Mem.category.insert(category);
    category._id = new mongoose.Types.ObjectId();
    return Models.Category.create(category);
  },
  async update(category) {
    if (await Db.useMemory()) return Mem.category.update(category);
    const newvalues = { name: category.name };
    return Models.Category.findByIdAndUpdate(category._id, newvalues, { new: true });
  },
  async delete(_id) {
    if (await Db.useMemory()) return Mem.category.delete(_id);
    return Models.Category.findByIdAndDelete(_id);
  },
  async selectByID(_id) {
    if (await Db.useMemory()) return Mem.category.selectByID(_id);
    if (!mongoose.isValidObjectId(_id)) return null;
    return Models.Category.findById(_id).exec();
  }
};
module.exports = CategoryDAO;
