import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiLock, FiCheckCircle } from 'react-icons/fi';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';
import { formatVND, imgSrc, authConfig } from '../utils/format';

function Mycart() {
  const ctx = useContext(MyContext);
  const navigate = useNavigate();
  const { mycart, customer, token } = ctx;
  const loggedIn = token !== '' && customer;
  const [shipping, setShipping] = useState({ name: '', phone: '', address: '', note: '', payment: 'COD' });
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(null);

  useEffect(() => {
    if (customer) setShipping((s) => ({ ...s, name: s.name || customer.name || '', phone: s.phone || customer.phone || '' }));
  }, [customer]);

  const total = CartUtil.getTotal(mycart);
  const count = CartUtil.getCount(mycart);
  const set = (k) => (e) => setShipping({ ...shipping, [k]: e.target.value });

  const checkout = (e) => {
    e.preventDefault();
    if (!loggedIn) {
      navigate('/login', { state: { from: '/mycart' } });
      return;
    }
    if (!shipping.name.trim() || !shipping.phone.trim() || !shipping.address.trim()) {
      ctx.notify('Vui lòng nhập họ tên, số điện thoại và địa chỉ nhận hàng', 'error');
      return;
    }
    if (!/^[0-9+\s.]{8,15}$/.test(shipping.phone.trim())) {
      ctx.notify('Số điện thoại không hợp lệ', 'error');
      return;
    }
    setSubmitting(true);
    const body = { total, items: mycart, customer, shipping };
    axios.post('/api/customer/checkout', body, authConfig(token))
      .then((res) => {
        const result = res.data;
        if (result && result._id) {
          setPlaced(result);
          ctx.clearCart();
          ctx.notify('Đặt hàng thành công!');
        } else if (result && result.success === false) {
          ctx.notify(result.message + ' – vui lòng đăng nhập lại', 'error');
          ctx.logout();
          navigate('/login', { state: { from: '/mycart' } });
        } else {
          ctx.notify('Đặt hàng thất bại, vui lòng thử lại', 'error');
        }
      })
      .catch(() => ctx.notify('Không kết nối được server', 'error'))
      .finally(() => setSubmitting(false));
  };

  if (placed) {
    return (
      <div className="container narrow">
        <div className="card success-card">
          <FiCheckCircle className="success-icon" />
          <h2>Cảm ơn bạn đã đặt hàng!</h2>
          <p>Mã đơn hàng: <b className="mono">{placed._id}</b></p>
          <p className="muted">Tổng thanh toán {formatVND(placed.total)} – SkyShop sẽ liên hệ xác nhận trong ít phút.</p>
          <div className="row-gap">
            <Link to="/myorders" className="btn btn-primary">Xem đơn hàng</Link>
            <Link to="/home" className="btn btn-outline">Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    );
  }

  if (mycart.length === 0) {
    return (
      <div className="container empty">
        <FiShoppingBag className="empty-icon" />
        <h3>Giỏ hàng của bạn đang trống</h3>
        <p className="muted">Hãy chọn vài sản phẩm yêu thích nhé.</p>
        <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
      </div>
    );
  }

  return (
    <div className="container cart">
      <div className="page-title">
        <h1>Giỏ hàng <span className="muted">({count} sản phẩm)</span></h1>
        <button className="btn btn-ghost" onClick={() => { if (window.confirm('Xoá tất cả sản phẩm trong giỏ?')) ctx.clearCart(); }}>
          <FiTrash2 /> Xoá tất cả
        </button>
      </div>

      <div className="cart-layout">
        <div className="card cart-items">
          {mycart.map((item) => (
            <div key={item.product._id} className="cart-item">
              <Link to={'/product/' + item.product._id} className="cart-thumb">
                <img src={imgSrc(item.product.image)} alt="" />
              </Link>
              <div className="cart-info">
                <Link to={'/product/' + item.product._id} className="cart-name">{item.product.name}</Link>
                <span className="muted small">{item.product.category ? item.product.category.name : ''}</span>
                <span className="cart-unit">{formatVND(item.product.price)}</span>
              </div>
              <div className="stepper sm">
                <button onClick={() => ctx.updateQuantity(item.product._id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Giảm"><FiMinus /></button>
                <input
                  type="number" min="1" max="99" value={item.quantity}
                  onChange={(e) => ctx.updateQuantity(item.product._id, parseInt(e.target.value, 10) || 1)}
                  aria-label="Số lượng"
                />
                <button onClick={() => ctx.updateQuantity(item.product._id, item.quantity + 1)} aria-label="Tăng"><FiPlus /></button>
              </div>
              <div className="cart-line">{formatVND(item.product.price * item.quantity)}</div>
              <button className="icon-btn danger" onClick={() => ctx.removeFromCart(item.product._id)} aria-label="Xoá" title="Xoá">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        <form className="card cart-summary" onSubmit={checkout}>
          <h3>Thông tin nhận hàng</h3>
          {loggedIn ? (
            <>
              <label className="field"><span>Họ và tên *</span><input value={shipping.name} onChange={set('name')} /></label>
              <label className="field"><span>Số điện thoại *</span><input type="tel" value={shipping.phone} onChange={set('phone')} /></label>
              <label className="field"><span>Địa chỉ nhận hàng *</span><input value={shipping.address} onChange={set('address')} placeholder="Số nhà, đường, phường, quận, tỉnh/thành" /></label>
              <label className="field"><span>Ghi chú</span><textarea rows="2" value={shipping.note} onChange={set('note')} placeholder="Giao giờ hành chính, gọi trước…" /></label>
              <div className="field">
                <span>Thanh toán</span>
                <label className="radio"><input type="radio" name="pay" checked={shipping.payment === 'COD'} onChange={() => setShipping({ ...shipping, payment: 'COD' })} /> Thanh toán khi nhận hàng (COD)</label>
                <label className="radio"><input type="radio" name="pay" checked={shipping.payment === 'BANK'} onChange={() => setShipping({ ...shipping, payment: 'BANK' })} /> Chuyển khoản ngân hàng</label>
              </div>
            </>
          ) : (
            <p className="muted">Bạn cần <Link to="/login" state={{ from: '/mycart' }}>đăng nhập</Link> để đặt hàng. Giỏ hàng vẫn được giữ nguyên.</p>
          )}

          <div className="summary-rows">
            <div><span>Tạm tính</span><span>{formatVND(total)}</span></div>
            <div><span>Phí vận chuyển</span><span className="free">Miễn phí</span></div>
            <div className="summary-total"><span>Tổng cộng</span><span>{formatVND(total)}</span></div>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {loggedIn ? (submitting ? 'Đang đặt hàng…' : 'Đặt hàng') : (<><FiLock /> Đăng nhập để đặt hàng</>)}
          </button>
          <Link to="/products" className="link-center">← Tiếp tục mua sắm</Link>
        </form>
      </div>
    </div>
  );
}

export default Mycart;
