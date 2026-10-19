import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser, FiMoon, FiSun, FiMapPin,
  FiPhone, FiTruck, FiLogOut, FiPackage, FiSettings, FiLogIn, FiUserPlus, FiKey, FiCloud
} from 'react-icons/fi';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';
import { formatVND, imgSrc, STORE, FREE_SHIP_TEXT } from '../utils/format';

function SearchBox() {
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // đóng gợi ý khi đổi trang
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // gợi ý tìm kiếm (debounce)
  useEffect(() => {
    const kw = keyword.trim();
    if (kw.length < 1) { setSuggestions([]); return undefined; }
    const timer = setTimeout(() => {
      axios.get('/api/customer/products', { params: { q: kw, size: 5 } })
        .then((res) => setSuggestions(res.data.products || []))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const onClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const kw = keyword.trim();
    if (!kw) return;
    setOpen(false);
    navigate('/product/search/' + encodeURIComponent(kw));
  };

  return (
    <form className="search" onSubmit={submit} ref={boxRef} role="search">
      <FiSearch className="search-icon" />
      <input
        type="search"
        placeholder="Bạn cần tìm gì hôm nay?"
        value={keyword}
        onChange={(e) => { setKeyword(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        aria-label="Tìm sản phẩm"
      />
      <button type="submit" className="search-btn">Tìm</button>
      {open && keyword.trim() && (
        <div className="search-suggest">
          {suggestions.length === 0 ? (
            <div className="suggest-empty">Không có gợi ý cho “{keyword.trim()}”</div>
          ) : (
            <>
              {suggestions.map((p) => (
                <Link key={p._id} to={'/product/' + p._id} className="suggest-item" onClick={() => setOpen(false)}>
                  <img src={imgSrc(p.image)} alt="" />
                  <span className="suggest-name">{p.name}</span>
                  <span className="suggest-price">{formatVND(p.price)}</span>
                </Link>
              ))}
              <button type="submit" className="suggest-all">Xem tất cả kết quả cho “{keyword.trim()}”</button>
            </>
          )}
        </div>
      )}
    </form>
  );
}

function Header() {
  const ctx = useContext(MyContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const cartCount = CartUtil.getCount(ctx.mycart);
  const loggedIn = ctx.token !== '' && ctx.customer;

  useEffect(() => {
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const logout = () => {
    ctx.logout();
    setMenuOpen(false);
    ctx.notify('Đã đăng xuất', 'info');
    navigate('/home');
  };

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-inner">
          <span><FiTruck /> {FREE_SHIP_TEXT}</span>
          <span className="hide-sm"><FiPhone /> Hotline: <b>{STORE.hotline}</b></span>
          <Link to="/gmap" className="hide-sm"><FiMapPin /> Hệ thống cửa hàng</Link>
        </div>
      </div>
      <div className="container header-main">
        <Link to="/home" className="logo" aria-label="SkyShop trang chủ">
          <span className="logo-mark"><FiCloud /></span>
          <span className="logo-text">Sky<b>Shop</b></span>
        </Link>

        <SearchBox />

        <nav className="header-actions">
          <button className="action theme-toggle" onClick={ctx.toggleTheme} aria-label="Đổi giao diện sáng/tối" title="Sáng / Tối">
            {ctx.theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
          <NavLink to="/wishlist" className="action" title="Yêu thích">
            <FiHeart />
            {ctx.wishlist.length > 0 && <span className="badge">{ctx.wishlist.length}</span>}
            <span className="action-label">Yêu thích</span>
          </NavLink>
          <NavLink to="/mycart" className="action" title="Giỏ hàng">
            <FiShoppingCart />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
            <span className="action-label">Giỏ hàng</span>
          </NavLink>
          <div className="account" ref={menuRef}>
            <button className="action" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
              {loggedIn ? <span className="avatar">{(ctx.customer.name || '?').trim().charAt(0).toUpperCase()}</span> : <FiUser />}
              <span className="action-label">{loggedIn ? ctx.customer.name : 'Tài khoản'}</span>
            </button>
            {menuOpen && (
              <div className="dropdown" role="menu" onClick={() => setMenuOpen(false)}>
                {loggedIn ? (
                  <>
                    <div className="dropdown-head">Xin chào, <b>{ctx.customer.name}</b></div>
                    <Link to="/myprofile"><FiSettings /> Tài khoản của tôi</Link>
                    <Link to="/myorders"><FiPackage /> Đơn hàng của tôi</Link>
                    <Link to="/wishlist"><FiHeart /> Sản phẩm yêu thích</Link>
                    <button onClick={logout}><FiLogOut /> Đăng xuất</button>
                  </>
                ) : (
                  <>
                    <Link to="/login"><FiLogIn /> Đăng nhập</Link>
                    <Link to="/signup"><FiUserPlus /> Đăng kí</Link>
                    <Link to="/active"><FiKey /> Kích hoạt tài khoản</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
