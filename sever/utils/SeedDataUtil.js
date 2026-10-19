const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Models = require('../models/Models');
const CryptoUtil = require('./CryptoUtil');
const S = require('./SampleData');

function createObjectId() {
  return new mongoose.Types.ObjectId();
}

function toPlainDocument(doc) {
  return doc && typeof doc.toObject === 'function' ? doc.toObject() : doc;
}

// ảnh banner cũ từng được dùng nhầm làm ảnh sản phẩm mẫu
function readOldBannerBase64(file) {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../client-customer/src/img', file)).toString('base64');
  } catch (error) {
    return null;
  }
}

async function ensureAdmin() {
  const admin = await Models.Admin.findOne({ username: S.SAMPLE_ADMIN.username }).exec();
  if (admin) return admin;
  return Models.Admin.create({ _id: createObjectId(), ...S.SAMPLE_ADMIN });
}

async function ensureCategories() {
  const existing = await Models.Category.find({}).exec();
  const names = new Set(existing.map((c) => (c.name || '').toLowerCase()));
  const toAdd = S.SAMPLE_CATEGORIES
    .filter((name) => !names.has(name.toLowerCase()))
    .map((name) => ({ _id: createObjectId(), name }));
  if (toAdd.length > 0) await Models.Category.insertMany(toAdd);
  return Models.Category.find({}).exec();
}

async function ensureProducts(categories) {
  const categoryMap = new Map(categories.map((c) => [(c.name || '').toLowerCase(), toPlainDocument(c)]));
  const existing = await Models.Product.find({}).select('name image description').exec();
  const byName = new Map(existing.map((p) => [(p.name || '').toLowerCase(), p]));
  const oldBanners = ['image2.jpg', 'image3.jpg'].map(readOldBannerBase64).filter(Boolean);

  const toAdd = [];
  for (const sample of S.SAMPLE_PRODUCTS) {
    const found = byName.get(sample.name.toLowerCase());
    if (!found) {
      const category = categoryMap.get(sample.categoryName.toLowerCase());
      if (!category) continue;
      toAdd.push({
        _id: createObjectId(), name: sample.name, price: sample.price, image: sample.image,
        description: sample.description, cdate: Date.now() - sample.daysAgo * S.DAY_IN_MS, category
      });
    } else {
      // nâng cấp sản phẩm mẫu cũ: thay ảnh banner bằng ảnh minh hoạ đúng loại + thêm mô tả
      const update = {};
      if (!found.image || oldBanners.includes(found.image)) update.image = sample.image;
      if (!found.description) update.description = sample.description;
      if (Object.keys(update).length > 0) {
        await Models.Product.updateOne({ _id: found._id }, { $set: update }).exec();
      }
    }
  }
  if (toAdd.length > 0) await Models.Product.insertMany(toAdd);
  return Models.Product.find({}).exec();
}

async function ensureCustomer() {
  const customer = await Models.Customer.findOne({ username: S.SAMPLE_CUSTOMER.username }).exec();
  if (customer) return customer;
  return Models.Customer.create({
    _id: createObjectId(), ...S.SAMPLE_CUSTOMER, token: CryptoUtil.md5('demo-customer')
  });
}

function buildOrder(products, customer, cfg) {
  const items = cfg.items.map((it) => {
    const product = products.find((p) => p.name === it.productName);
    return { product: toPlainDocument(product), quantity: it.quantity };
  }).filter((it) => it.product);
  return {
    _id: createObjectId(),
    cdate: Date.now() - cfg.daysAgo * S.DAY_IN_MS,
    total: items.reduce((s, it) => s + it.product.price * it.quantity, 0),
    status: cfg.status,
    customer: toPlainDocument(customer),
    items
  };
}

async function ensureOrders(products, customer) {
  const approved = await Models.Order.countDocuments({ status: 'APPROVED' }).exec();
  const mine = await Models.Order.countDocuments({ 'customer._id': customer._id }).exec();
  const orders = [];
  if (approved === 0) orders.push(buildOrder(products, customer, S.SAMPLE_ORDERS[0]));
  if (mine === 0) orders.push(buildOrder(products, customer, S.SAMPLE_ORDERS[1]));
  const valid = orders.filter((o) => o.items.length > 0);
  if (valid.length > 0) await Models.Order.insertMany(valid);
}

const SeedDataUtil = {
  hasSeeded: false,
  async seed() {
    if (this.hasSeeded) return;
    await ensureAdmin();
    const categories = await ensureCategories();
    const products = await ensureProducts(categories);
    const customer = await ensureCustomer();
    await ensureOrders(products, customer);
    this.hasSeeded = true;
  }
};

module.exports = SeedDataUtil;
