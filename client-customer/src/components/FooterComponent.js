import React from 'react';
import { Link } from 'react-router-dom';
import { FiCloud, FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { STORE } from '../utils/format';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link to="/home" className="logo logo-footer">
            <span className="logo-mark"><FiCloud /></span>
            <span className="logo-text">Sky<b>Shop</b></span>
          </Link>
          <p className="muted">Điện thoại, laptop, phụ kiện chính hãng. Giá tốt mỗi ngày, giao nhanh tận nơi.</p>
        </div>
        <div>
          <h4>Mua sắm</h4>
          <Link to="/products">Tất cả sản phẩm</Link>
          <Link to="/products?sort=price_asc">Giá tốt nhất</Link>
          <Link to="/wishlist">Sản phẩm yêu thích</Link>
          <Link to="/mycart">Giỏ hàng</Link>
        </div>
        <div>
          <h4>Tài khoản</h4>
          <Link to="/login">Đăng nhập</Link>
          <Link to="/signup">Đăng kí</Link>
          <Link to="/myorders">Tra cứu đơn hàng</Link>
          <Link to="/myprofile">Thông tin cá nhân</Link>
        </div>
        <div>
          <h4>Liên hệ</h4>
          <p><FiPhone /> {STORE.hotline}</p>
          <p><FiMail /> {STORE.email}</p>
          <p><FiMapPin /> <Link to="/gmap">{STORE.address}</Link></p>
          <p><FiClock /> {STORE.hours}</p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">© {new Date().getFullYear()} SkyShop. Đồ án website bán hàng.</div>
      </div>
    </footer>
  );
}
export default Footer;
