import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiArrowUp, FiAlertTriangle, FiX } from 'react-icons/fi';
import Header from './InformComponent';
import CategoryNav from './MenuComponent';
import Footer from './FooterComponent';
import Toasts from './ToastComponent';
import Home from './HomeComponent';
import Product from './ProductComponent';
import ProductDetail from './ProductDetailComponent';
import Signup from './SignupComponent';
import Active from './ActiveComponent';
import Login from './LoginComponent';
import Myprofile from './MyprofileComponent';
import Mycart from './MycartComponent';
import Myorders from './MyordersComponent';
import Wishlist from './WishlistComponent';
import Gmap from './GmapComponent';
import NotFound from './NotFoundComponent';
import TawkMessenger from './TawkMessengerComponent';
import MyContext from '../contexts/MyContext';

// Thanh cảnh báo khi server tắt hoặc đang chạy dữ liệu dự phòng
function SystemBanner() {
  const [status, setStatus] = useState(null);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    axios.get('/api/customer/health', { timeout: 20000 })
      .then((res) => setStatus(res.data && res.data.mode === 'memory' ? 'memory' : 'ok'))
      .catch(() => setStatus('down'));
  }, []);
  if (hidden || !status || status === 'ok') return null;
  return (
    <div className={'sys-banner ' + status}>
      <FiAlertTriangle />
      {status === 'down' ? (
        <span>Không kết nối được server. Hãy mở terminal tại thư mục <b>sever</b> và chạy <code>npm start</code> (cổng 3000).</span>
      ) : (
        <span>Đang hiển thị <b>dữ liệu mẫu</b> vì server chưa kết nối được MongoDB. Xem hướng dẫn trong cửa sổ terminal của server.</span>
      )}
      <button className="icon-btn" onClick={() => setHidden(true)} aria-label="Đóng"><FiX /></button>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Lên đầu trang">
      <FiArrowUp />
    </button>
  );
}

function Main() {
  const { theme } = useContext(MyContext);
  return (
    <div className="body-customer" data-theme={theme}>
      <ScrollToTop />
      <SystemBanner />
      <Header />
      <CategoryNav />
      <main className="page">
        <Routes>
          <Route path="/" element={<Navigate replace to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Product />} />
          <Route path="/product/category/:cid" element={<Product />} />
          <Route path="/product/search/:keyword" element={<Product />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/active" element={<Active />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Navigate replace to="/home" />} />
          <Route path="/myprofile" element={<Myprofile />} />
          <Route path="/mycart" element={<Mycart />} />
          <Route path="/myorders" element={<Myorders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/gmap" element={<Gmap />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toasts />
      <BackToTop />
      <TawkMessenger />
    </div>
  );
}
export default Main;
