import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FiTruck, FiShield, FiRefreshCw, FiCreditCard, FiChevronLeft, FiChevronRight, FiArrowRight
} from 'react-icons/fi';
import ProductCard, { ProductGridSkeleton } from './ProductCard';
import MyContext from '../contexts/MyContext';
import { CategoryIcon } from '../utils/format';
import image3 from '../img/image3.jpg';
import image4 from '../img/image4.png';
import image5 from '../img/image5.png';

const SLIDES = [
  { image: image5, full: true, alt: 'iPhone 15 Titan – giá chỉ từ 21.690.000đ' },
  { image: image4, kicker: 'iPhone 15 Pro', title: 'Titan. Mạnh mẽ. Nhẹ nhàng.', text: 'Đủ màu, sẵn hàng – trả góp 0% lãi suất.', cta: 'iPhone' },
  { image: image3, kicker: 'Lên đời dễ dàng', title: 'Thu cũ đổi mới – lên đời tiết kiệm', text: 'Định giá nhanh, minh bạch ngay tại cửa hàng.', cta: 'Thu cũ đổi mới' }
];

function Hero({ categories }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const catLink = (name) => {
    const c = categories.find((x) => x.name.toLowerCase() === (name || '').toLowerCase());
    return c ? '/product/category/' + c._id : '/products';
  };
  const go = (d) => setIndex((i) => (i + d + SLIDES.length) % SLIDES.length);

  return (
    <section className="hero container">
      <div className="hero-main" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {SLIDES.map((s, i) => (
          <div key={i} className={'slide' + (i === index ? ' active' : '') + (s.full ? ' full' : '')} aria-hidden={i !== index}>
            {s.full ? (
              <img src={s.image} alt={s.alt} />
            ) : (
              <>
                <div className="slide-text">
                  <span className="kicker">{s.kicker}</span>
                  <h2>{s.title}</h2>
                  <p>{s.text}</p>
                  <Link to={catLink(s.cta)} className="btn btn-light">Mua ngay <FiArrowRight /></Link>
                </div>
                <img src={s.image} alt="" />
              </>
            )}
          </div>
        ))}
        <button className="hero-nav prev" onClick={() => go(-1)} aria-label="Slide trước"><FiChevronLeft /></button>
        <button className="hero-nav next" onClick={() => go(1)} aria-label="Slide sau"><FiChevronRight /></button>
        <div className="hero-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={i === index ? 'active' : ''} onClick={() => setIndex(i)} aria-label={'Slide ' + (i + 1)} />
          ))}
        </div>
      </div>
      <div className="hero-side">
        <Link to={catLink('Macbook')} className="promo promo-a">
          <span className="kicker">Macbook Air M3</span>
          <b>Mỏng nhẹ, pin cả ngày</b>
          <span className="promo-cta">Khám phá <FiArrowRight /></span>
        </Link>
        <Link to={catLink('Khuyến mãi')} className="promo promo-b">
          <span className="kicker">Ưu đãi tuần này</span>
          <b>Combo Apple giảm sâu</b>
          <span className="promo-cta">Xem ngay <FiArrowRight /></span>
        </Link>
      </div>
    </section>
  );
}

const SERVICES = [
  { icon: FiTruck, title: 'Giao nhanh 2 giờ', text: 'Miễn phí toàn quốc' },
  { icon: FiShield, title: 'Bảo hành 12 tháng', text: 'Chính hãng 100%' },
  { icon: FiRefreshCw, title: 'Đổi trả 30 ngày', text: 'Lỗi là đổi mới' },
  { icon: FiCreditCard, title: 'Trả góp 0%', text: 'Duyệt nhanh 15 phút' }
];

function Section({ title, link, linkText = 'Xem tất cả', children }) {
  return (
    <section className="section container">
      <div className="section-head">
        <h2>{title}</h2>
        {link && <Link to={link} className="link-more">{linkText} <FiArrowRight /></Link>}
      </div>
      {children}
    </section>
  );
}

function Home() {
  const { recent } = useContext(MyContext);
  const [categories, setCategories] = useState([]);
  const [newprods, setNewprods] = useState(null);
  const [hotprods, setHotprods] = useState(null);
  const [cheap, setCheap] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fail = () => setError(true);
    axios.get('/api/customer/categories').then((res) => setCategories(res.data || [])).catch(fail);
    axios.get('/api/customer/products/new', { params: { top: 8 } }).then((res) => setNewprods(res.data || [])).catch(() => { setNewprods([]); fail(); });
    axios.get('/api/customer/products/hot', { params: { top: 4 } }).then((res) => setHotprods(res.data || [])).catch(() => setHotprods([]));
    axios.get('/api/customer/products', { params: { sort: 'price_asc', size: 4 } }).then((res) => setCheap(res.data.products || [])).catch(() => setCheap([]));
  }, []);

  const grid = (list, n = 4) => (
    <div className="product-grid">
      {list === null ? <ProductGridSkeleton count={n} /> : list.map((p) => <ProductCard key={p._id} product={p} />)}
    </div>
  );

  return (
    <div className="home">
      <Hero categories={categories} />

      <section className="container services">
        {SERVICES.map((s) => (
          <div key={s.title} className="service">
            <s.icon className="service-icon" />
            <div><b>{s.title}</b><span>{s.text}</span></div>
          </div>
        ))}
      </section>

      {error && (
        <div className="container">
          <div className="alert error">Không tải được dữ liệu sản phẩm từ server. Kiểm tra server Node (cổng 3000) đã chạy chưa.</div>
        </div>
      )}

      {categories.length > 0 && (
        <Section title="Danh mục nổi bật">
          <div className="cat-tiles">
            {categories.map((c) => (
              <Link key={c._id} to={'/product/category/' + c._id} className="cat-tile">
                <span className="cat-tile-icon"><CategoryIcon name={c.name} /></span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="Sản phẩm mới" link="/products">
        {newprods && newprods.length === 0 && !error ? <p className="muted">Chưa có sản phẩm nào.</p> : grid(newprods, 8)}
      </Section>

      {(hotprods === null || hotprods.length > 0) && (
        <Section title="🔥 Bán chạy nhất" link="/products">
          {grid(hotprods)}
        </Section>
      )}

      {(cheap === null || cheap.length > 0) && (
        <Section title="Giá tốt cho bạn" link="/products?sort=price_asc">
          {grid(cheap)}
        </Section>
      )}

      {recent.length > 0 && (
        <Section title="Bạn đã xem gần đây">
          {grid(recent.slice(0, 4))}
        </Section>
      )}
    </div>
  );
}

export default Home;
