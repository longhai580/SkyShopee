const router = require('../utils/AsyncRouter')();
// utils
const CryptoUtil = require('../utils/CryptoUtil');
const EmailUtil = require('../utils/EmailUtil');
const JwtUtil = require('../utils/JwtUtil');
const Db = require('../utils/Db');
// daos
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const CustomerDAO = require('../models/CustomerDAO');
const OrderDAO = require('../models/OrderDAO');

function toPlain(doc) {
  return doc && typeof doc.toObject === 'function' ? doc.toObject() : doc;
}
function withSold(products, sold) {
  return products.map((p) => {
    const obj = toPlain(p);
    obj.sold = sold[String(obj._id)] || 0;
    return obj;
  });
}
function toNumber(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// trạng thái hệ thống (để client hiển thị cảnh báo khi đang chạy dữ liệu dự phòng)
router.get('/health', async function (req, res) {
  await Db.useMemory();
  res.json({ success: true, mode: Db.state.mode, error: Db.state.error });
});

// category
router.get('/categories', async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

// product
// GET /products?cid=&q=&min=&max=&sort=newest|price_asc|price_desc|name&page=1&size=12
router.get('/products', async function (req, res) {
  const size = Math.min(Math.max(parseInt(req.query.size, 10) || 12, 1), 48);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const opts = {
    cid: req.query.cid || null,
    q: (req.query.q || '').trim() || null,
    min: toNumber(req.query.min),
    max: toNumber(req.query.max),
    sort: req.query.sort || 'newest',
    skip: (page - 1) * size,
    limit: size
  };
  const [result, sold] = await Promise.all([ProductDAO.query(opts), ProductDAO.soldCounts()]);
  res.json({
    products: withSold(result.products, sold),
    total: result.total,
    noPages: Math.max(Math.ceil(result.total / size), 1),
    curPage: page,
    size: size
  });
});
router.get('/products/new', async function (req, res) {
  const top = Math.min(parseInt(req.query.top, 10) || 4, 24);
  const [products, sold] = await Promise.all([ProductDAO.selectTopNew(top), ProductDAO.soldCounts()]);
  res.json(withSold(products, sold));
});
router.get('/products/hot', async function (req, res) {
  const top = Math.min(parseInt(req.query.top, 10) || 4, 24);
  const [products, sold] = await Promise.all([ProductDAO.selectTopHot(top), ProductDAO.soldCounts()]);
  res.json(withSold(products, sold));
});
//customer-listproduct
router.get('/products/category/:cid', async function (req, res) {
  const [products, sold] = await Promise.all([ProductDAO.selectByCatID(req.params.cid), ProductDAO.soldCounts()]);
  res.json(withSold(products, sold));
});
//customer-search
router.get('/products/search/:keyword', async function (req, res) {
  const [products, sold] = await Promise.all([ProductDAO.selectByKeyword(req.params.keyword), ProductDAO.soldCounts()]);
  res.json(withSold(products, sold));
});
router.get('/products/related/:id', async function (req, res) {
  const product = await ProductDAO.selectByID(req.params.id);
  if (!product) return res.json([]);
  const [products, sold] = await Promise.all([ProductDAO.selectRelated(toPlain(product), 4), ProductDAO.soldCounts()]);
  res.json(withSold(products, sold));
});
router.get('/products/:id', async function (req, res) {
  const product = await ProductDAO.selectByID(req.params.id);
  if (!product) return res.json(null);
  const sold = await ProductDAO.soldCounts();
  res.json(withSold([product], sold)[0]);
});

// customer
router.post('/signup', async function (req, res) {
  const { username, password, name, phone, email } = req.body;
  if (!username || !password || !name || !phone || !email) {
    return res.json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
  }
  const dbCust = await CustomerDAO.selectByUsernameOrEmail(username, email);
  if (dbCust) {
    return res.json({ success: false, message: 'Tên tài khoản hoặc email đã tồn tại' });
  }
  const now = new Date().getTime(); // milliseconds
  const token = CryptoUtil.md5(now.toString());
  const newCust = { username, password, name, phone, email, active: 0, token: token };
  const result = await CustomerDAO.insert(newCust);
  if (!result) {
    return res.json({ success: false, message: 'Không thể tạo tài khoản' });
  }
  let sent = false;
  try {
    sent = await EmailUtil.send(email, result._id, token);
  } catch (err) {
    console.error('[EMAIL]', err.message);
  }
  if (sent) {
    res.json({ success: true, message: 'Đăng kí thành công! Vui lòng kiểm tra email để lấy mã kích hoạt.' });
  } else {
    // Gửi email thất bại -> trả ID + token để người dùng tự kích hoạt
    res.json({
      success: true,
      emailFailed: true,
      id: result._id,
      token: token,
      message: 'Đăng kí thành công nhưng chưa gửi được email. Dùng ID và Token bên dưới để kích hoạt.'
    });
  }
});
router.post('/active', async function (req, res) {
  const result = await CustomerDAO.active(req.body.id, req.body.token, 1);
  res.json(result);
});
router.post('/login', async function (req, res) {
  const { username, password } = req.body;
  if (username && password) {
    const customer = await CustomerDAO.selectByUsernameAndPassword(username, password);
    if (customer) {
      if (customer.active === 1) {
        const token = JwtUtil.genToken();
        res.json({ success: true, message: 'Authentication successful', token: token, customer: customer });
      } else {
        res.json({ success: false, message: 'Tài khoản chưa được kích hoạt' });
      }
    } else {
      res.json({ success: false, message: 'Sai tên tài khoản hoặc mật khẩu' });
    }
  } else {
    res.json({ success: false, message: 'Vui lòng nhập tên tài khoản và mật khẩu' });
  }
});
router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, message: 'Token is valid', token: token });
});
// myprofile
router.put('/customers/:id', JwtUtil.checkToken, async function (req, res) {
  const { username, password, name, phone, email } = req.body;
  const customer = { _id: req.params.id, username, password, name, phone, email };
  const result = await CustomerDAO.update(customer);
  res.json(result);
});
// mycart
router.post('/checkout', JwtUtil.checkToken, async function (req, res) {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const customer = req.body.customer;
  if (!customer || items.length === 0) {
    return res.json(null);
  }
  // tính lại tổng tiền phía server
  const total = items.reduce((sum, it) => sum + (Number(it.product && it.product.price) || 0) * (parseInt(it.quantity, 10) || 0), 0);
  const order = {
    cdate: new Date().getTime(),
    total: total,
    status: 'PENDING',
    customer: customer,
    shipping: req.body.shipping || null,
    items: items
  };
  const result = await OrderDAO.insert(order);
  res.json(result);
});
// myorders
router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  const orders = await OrderDAO.selectByCustID(req.params.cid);
  res.json(orders);
});
// khách tự huỷ đơn đang chờ duyệt
router.put('/orders/cancel/:id', JwtUtil.checkToken, async function (req, res) {
  const order = await OrderDAO.selectByID(req.params.id);
  if (!order) return res.json({ success: false, message: 'Không tìm thấy đơn hàng' });
  if (!order.customer || String(order.customer._id) !== String(req.body.cid)) {
    return res.json({ success: false, message: 'Bạn không có quyền huỷ đơn này' });
  }
  if (order.status !== 'PENDING') {
    return res.json({ success: false, message: 'Chỉ huỷ được đơn đang chờ duyệt' });
  }
  const result = await OrderDAO.update(req.params.id, 'CANCELED');
  res.json({ success: true, order: result });
});

module.exports = router;
