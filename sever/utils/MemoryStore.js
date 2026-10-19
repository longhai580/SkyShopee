// Kho dữ liệu trong bộ nhớ — dùng khi KHÔNG kết nối được MongoDB.
// Dữ liệu sẽ mất khi khởi động lại server (chỉ để chạy thử / demo).
const crypto = require('crypto');
const S = require('./SampleData');

const newId = () => crypto.randomBytes(12).toString('hex');
const clone = (x) => (x == null ? x : JSON.parse(JSON.stringify(x)));
const sameId = (a, b) => String(a) === String(b);

const db = { admins: [], categories: [], customers: [], products: [], orders: [] };
let inited = false;

function md5(s) { return crypto.createHash('md5').update(s).digest('hex'); }

function init() {
  if (inited) return;
  inited = true;
  db.admins.push({ _id: newId(), ...S.SAMPLE_ADMIN });
  S.SAMPLE_CATEGORIES.forEach((name) => db.categories.push({ _id: newId(), name }));
  S.SAMPLE_PRODUCTS.forEach((p) => {
    const category = db.categories.find((c) => c.name === p.categoryName);
    db.products.push({
      _id: newId(), name: p.name, price: p.price, image: p.image, description: p.description,
      cdate: Date.now() - p.daysAgo * S.DAY_IN_MS, category: clone(category)
    });
  });
  const customer = { _id: newId(), ...S.SAMPLE_CUSTOMER, token: md5('demo-customer') };
  db.customers.push(customer);
  S.SAMPLE_ORDERS.forEach((o) => {
    const items = o.items.map((it) => ({
      product: clone(db.products.find((p) => p.name === it.productName)), quantity: it.quantity
    })).filter((it) => it.product);
    db.orders.push({
      _id: newId(), cdate: Date.now() - o.daysAgo * S.DAY_IN_MS, status: o.status,
      total: items.reduce((s, it) => s + it.product.price * it.quantity, 0),
      customer: clone(customer), items
    });
  });
}

function sortProducts(list, sort) {
  const arr = list.slice();
  switch (sort) {
    case 'price_asc': return arr.sort((a, b) => a.price - b.price);
    case 'price_desc': return arr.sort((a, b) => b.price - a.price);
    case 'name': return arr.sort((a, b) => a.name.localeCompare(b.name));
    case 'oldest': return arr.sort((a, b) => a.cdate - b.cdate);
    default: return arr.sort((a, b) => b.cdate - a.cdate);
  }
}

function escapeRegex(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

const Mem = {
  init,
  admin: {
    selectByUsernameAndPassword(u, p) { return clone(db.admins.find((a) => a.username === u && a.password === p)) || null; }
  },
  category: {
    selectAll() { return clone(db.categories); },
    insert(c) { const n = { _id: newId(), name: c.name }; db.categories.push(n); return clone(n); },
    update(c) {
      const f = db.categories.find((x) => sameId(x._id, c._id));
      if (!f) return null;
      f.name = c.name;
      return clone(f);
    },
    delete(id) {
      const i = db.categories.findIndex((x) => sameId(x._id, id));
      return i === -1 ? null : clone(db.categories.splice(i, 1)[0]);
    },
    selectByID(id) { return clone(db.categories.find((x) => sameId(x._id, id))) || null; }
  },
  customer: {
    selectByUsernameOrEmail(u, e) { return clone(db.customers.find((c) => c.username === u || c.email === e)) || null; },
    insert(c) { const n = { ...c, _id: newId() }; db.customers.push(n); return clone(n); },
    active(id, token, active) {
      const f = db.customers.find((c) => sameId(c._id, id) && c.token === token);
      if (!f) return null;
      f.active = active;
      return clone(f);
    },
    selectByUsernameAndPassword(u, p) { return clone(db.customers.find((c) => c.username === u && c.password === p)) || null; },
    update(c) {
      const f = db.customers.find((x) => sameId(x._id, c._id));
      if (!f) return null;
      Object.assign(f, { username: c.username, password: c.password, name: c.name, phone: c.phone, email: c.email });
      return clone(f);
    },
    selectAll() { return clone(db.customers); },
    selectByID(id) { return clone(db.customers.find((x) => sameId(x._id, id))) || null; }
  },
  order: {
    insert(o) { const n = { ...clone(o), _id: newId() }; db.orders.push(n); return clone(n); },
    selectByCustID(cid) {
      return clone(db.orders.filter((o) => o.customer && sameId(o.customer._id, cid)).sort((a, b) => b.cdate - a.cdate));
    },
    selectAll() { return clone(db.orders.slice().sort((a, b) => b.cdate - a.cdate)); },
    selectByID(id) { return clone(db.orders.find((o) => sameId(o._id, id))) || null; },
    update(id, status) {
      const f = db.orders.find((o) => sameId(o._id, id));
      if (!f) return null;
      f.status = status;
      return clone(f);
    }
  },
  product: {
    selectByCount() { return db.products.length; },
    selectBySkipLimit(skip, limit) { return clone(db.products.slice(skip, skip + limit)); },
    insert(p) { const n = { ...clone(p), _id: newId() }; db.products.push(n); return clone(n); },
    selectByID(id) { return clone(db.products.find((p) => sameId(p._id, id))) || null; },
    update(p) {
      const f = db.products.find((x) => sameId(x._id, p._id));
      if (!f) return null;
      Object.assign(f, { name: p.name, price: p.price, image: p.image, category: clone(p.category) });
      if (p.description !== undefined) f.description = p.description;
      return clone(f);
    },
    delete(id) {
      const i = db.products.findIndex((x) => sameId(x._id, id));
      return i === -1 ? null : clone(db.products.splice(i, 1)[0]);
    },
    selectTopNew(top) { return clone(sortProducts(db.products, 'newest').slice(0, top)); },
    soldCounts() {
      const map = {};
      db.orders.filter((o) => o.status === 'APPROVED').forEach((o) => o.items.forEach((it) => {
        const k = String(it.product._id);
        map[k] = (map[k] || 0) + it.quantity;
      }));
      return map;
    },
    selectTopHot(top) {
      const sold = Mem.product.soldCounts();
      return Object.keys(sold).sort((a, b) => sold[b] - sold[a]).slice(0, top)
        .map((id) => Mem.product.selectByID(id)).filter(Boolean);
    },
    selectByCatID(cid) { return clone(db.products.filter((p) => p.category && sameId(p.category._id, cid))); },
    selectByKeyword(k) {
      const re = new RegExp(escapeRegex(k), 'i');
      return clone(db.products.filter((p) => re.test(p.name)));
    },
    query({ cid, q, min, max, sort, skip, limit }) {
      let list = db.products;
      if (cid) list = list.filter((p) => p.category && sameId(p.category._id, cid));
      if (q) { const re = new RegExp(escapeRegex(q), 'i'); list = list.filter((p) => re.test(p.name)); }
      if (min != null) list = list.filter((p) => p.price >= min);
      if (max != null) list = list.filter((p) => p.price <= max);
      const total = list.length;
      const products = clone(sortProducts(list, sort).slice(skip, skip + limit));
      return { products, total };
    },
    selectRelated(product, limit) {
      const cid = product.category && product.category._id;
      let list = db.products.filter((p) => !sameId(p._id, product._id) && p.category && sameId(p.category._id, cid));
      if (list.length < limit) {
        const more = db.products.filter((p) => !sameId(p._id, product._id) && !list.includes(p));
        list = list.concat(sortProducts(more, 'newest'));
      }
      return clone(list.slice(0, limit));
    }
  },
  escapeRegex
};

module.exports = Mem;
