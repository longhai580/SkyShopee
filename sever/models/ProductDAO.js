require('../utils/MongooseUtil');
const mongoose = require('mongoose');
const Models = require('./Models');
const Db = require('../utils/Db');
const Mem = require('../utils/MemoryStore');

const SORTS = {
  newest: { cdate: -1 },
  oldest: { cdate: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name: { name: 1 }
};

const ProductDAO = {
  async selectByCount() {
    if (await Db.useMemory()) return Mem.product.selectByCount();
    return Models.Product.countDocuments({}).exec();
  },
  async selectBySkipLimit(skip, limit) {
    if (await Db.useMemory()) return Mem.product.selectBySkipLimit(skip, limit);
    return Models.Product.find({}).skip(skip).limit(limit).exec();
  },
  async insert(product) {
    if (await Db.useMemory()) return Mem.product.insert(product);
    product._id = new mongoose.Types.ObjectId();
    return Models.Product.create(product);
  },
  async update(product) {
    if (await Db.useMemory()) return Mem.product.update(product);
    const newvalues = { name: product.name, price: product.price, image: product.image, category: product.category };
    if (product.description !== undefined) newvalues.description = product.description;
    return Models.Product.findByIdAndUpdate(product._id, newvalues, { new: true });
  },
  async delete(_id) {
    if (await Db.useMemory()) return Mem.product.delete(_id);
    return Models.Product.findByIdAndDelete(_id);
  },
  async selectByID(_id) {
    if (await Db.useMemory()) return Mem.product.selectByID(_id);
    if (!mongoose.isValidObjectId(_id)) return null;
    return Models.Product.findById(_id).exec();
  },
  async selectTopNew(top) {
    if (await Db.useMemory()) return Mem.product.selectTopNew(top);
    return Models.Product.find({}).sort({ cdate: -1 }).limit(top).exec();
  },
  // { productId: tổng số lượng đã bán (đơn APPROVED) }
  async soldCounts() {
    if (await Db.useMemory()) return Mem.product.soldCounts();
    const rows = await Models.Order.aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product._id', sum: { $sum: '$items.quantity' } } }
    ]).exec();
    const map = {};
    rows.forEach((r) => { if (r._id) map[String(r._id)] = r.sum; });
    return map;
  },
  async selectTopHot(top) {
    if (await Db.useMemory()) return Mem.product.selectTopHot(top);
    const items = await Models.Order.aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product._id', sum: { $sum: '$items.quantity' } } },
      { $sort: { sum: -1 } },
      { $limit: top }
    ]).exec();
    const products = [];
    for (const item of items) {
      const product = await ProductDAO.selectByID(item._id);
      if (product) products.push(product); // bỏ qua sản phẩm đã bị xoá
    }
    return products;
  },
  async selectByCatID(_cid) {
    if (await Db.useMemory()) return Mem.product.selectByCatID(_cid);
    if (!mongoose.isValidObjectId(_cid)) return [];
    return Models.Product.find({ 'category._id': _cid }).exec();
  },
  async selectByKeyword(keyword) {
    if (await Db.useMemory()) return Mem.product.selectByKeyword(keyword);
    const query = { name: { $regex: new RegExp(Mem.escapeRegex(keyword), 'i') } };
    return Models.Product.find(query).exec();
  },
  // tìm kiếm + lọc + sắp xếp + phân trang
  async query(opts) {
    if (await Db.useMemory()) return Mem.product.query(opts);
    const filter = {};
    if (opts.cid) {
      if (!mongoose.isValidObjectId(opts.cid)) return { products: [], total: 0 };
      filter['category._id'] = new mongoose.Types.ObjectId(opts.cid);
    }
    if (opts.q) filter.name = { $regex: new RegExp(Mem.escapeRegex(opts.q), 'i') };
    if (opts.min != null || opts.max != null) {
      filter.price = {};
      if (opts.min != null) filter.price.$gte = opts.min;
      if (opts.max != null) filter.price.$lte = opts.max;
    }
    const sort = SORTS[opts.sort] || SORTS.newest;
    const [total, products] = await Promise.all([
      Models.Product.countDocuments(filter).exec(),
      Models.Product.find(filter).sort(sort).skip(opts.skip).limit(opts.limit).exec()
    ]);
    return { products, total };
  },
  async selectRelated(product, limit) {
    if (await Db.useMemory()) return Mem.product.selectRelated(product, limit);
    const cid = product.category && product.category._id;
    let list = cid
      ? await Models.Product.find({ 'category._id': cid, _id: { $ne: product._id } }).limit(limit).exec()
      : [];
    if (list.length < limit) {
      const exclude = [product._id].concat(list.map((p) => p._id));
      const more = await Models.Product.find({ _id: { $nin: exclude } }).sort({ cdate: -1 }).limit(limit - list.length).exec();
      list = list.concat(more);
    }
    return list;
  }
};

module.exports = ProductDAO;
