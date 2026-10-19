import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  FiHeart, FiShoppingCart, FiMinus, FiPlus, FiTruck, FiShield, FiRefreshCw, FiCheckCircle, FiShare2
} from 'react-icons/fi';
import MyContext from '../contexts/MyContext';
import ProductCard, { ProductGridSkeleton } from './ProductCard';
import { formatVND, formatDate, imgSrc, isNewProduct } from '../utils/format';

function ZoomImage({ src, alt }) {
  const [origin, setOrigin] = useState('50% 50%');
  const [zoom, setZoom] = useState(false);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(((e.clientX - r.left) / r.width) * 100 + '% ' + ((e.clientY - r.top) / r.height) * 100 + '%');
  };
  return (
    <div className="zoom" onMouseEnter={() => setZoom(true)} onMouseLeave={() => setZoom(false)} onMouseMove={onMove}>
      <img src={src} alt={alt} style={{ transformOrigin: origin, transform: zoom ? 'scale(1.8)' : 'scale(1)' }} />
    </div>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ctx = useContext(MyContext);
  const [product, setProduct] = useState(undefined); // undefined = đang tải, null = không có
  const [related, setRelated] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('desc');
  const { addRecent } = ctx;

  useEffect(() => {
    setProduct(undefined);
    setRelated(null);
    setQuantity(1);
    axios.get('/api/customer/products/' + id)
      .then((res) => {
        setProduct(res.data || null);
        if (res.data) addRecent(res.data);
      })
      .catch(() => setProduct(null));
    axios.get('/api/customer/products/related/' + id)
      .then((res) => setRelated(res.data || []))
      .catch(() => setRelated([]));
  }, [id, addRecent]);

  if (product === undefined) {
    return (
      <div className="container detail">
        <div className="detail-grid">
          <div className="detail-media sk-block" style={{ minHeight: 420 }} />
          <div><div className="sk-line w40" /><div className="sk-line" /><div className="sk-line w60" /></div>
        </div>
      </div>
    );
  }
  if (product === null) {
    return (
      <div className="container empty">
        <h3>Không tìm thấy sản phẩm</h3>
        <p className="muted">Sản phẩm có thể đã ngừng kinh doanh.</p>
        <Link to="/products" className="btn btn-primary">Xem sản phẩm khác</Link>
      </div>
    );
  }

  const wished = ctx.isWished(product._id);
  const add = () => {
    ctx.addToCart(product, quantity);
    ctx.notify('Đã thêm ' + quantity + ' × “' + product.name + '” vào giỏ hàng');
  };
  const buyNow = () => {
    ctx.addToCart(product, quantity);
    navigate('/mycart');
  };
  const share = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => ctx.notify('Đã sao chép liên kết sản phẩm', 'info')).catch(() => {});
    }
  };

  return (
    <div className="container detail">
      <nav className="breadcrumb">
        <Link to="/home">Trang chủ</Link><span>/</span>
        {product.category ? <Link to={'/product/category/' + product.category._id}>{product.category.name}</Link> : <Link to="/products">Sản phẩm</Link>}
        <span>/</span><span>{product.name}</span>
      </nav>

      <div className="detail-grid">
        <div className="detail-media">
          {isNewProduct(product) && <span className="tag tag-new">Mới</span>}
          <ZoomImage src={imgSrc(product.image)} alt={product.name} />
        </div>

        <div className="detail-info">
          {product.category && <span className="pcard-cat">{product.category.name}</span>}
          <h1>{product.name}</h1>
          <div className="detail-meta">
            <span className="stock"><FiCheckCircle /> Còn hàng</span>
            <span className="muted">{product.sold > 0 ? 'Đã bán ' + product.sold : 'Sản phẩm mới'}</span>
          </div>
          <div className="detail-price">{formatVND(product.price)}</div>
          {product.description && <p className="detail-desc">{product.description}</p>}

          <div className="qty-row">
            <span>Số lượng</span>
            <div className="stepper">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Giảm"><FiMinus /></button>
              <input
                type="number" min="1" max="99" value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1)))}
                aria-label="Số lượng"
              />
              <button onClick={() => setQuantity((q) => Math.min(99, q + 1))} aria-label="Tăng"><FiPlus /></button>
            </div>
            <span className="muted">Tạm tính: <b>{formatVND(product.price * quantity)}</b></span>
          </div>

          <div className="detail-actions">
            <button className="btn btn-primary btn-lg" onClick={buyNow}>
              Mua ngay
              <small>Giao nhanh 2 giờ hoặc nhận tại cửa hàng</small>
            </button>
            <button className="btn btn-outline btn-lg" onClick={add}><FiShoppingCart /> Thêm vào giỏ</button>
            <button
              className={'btn btn-icon' + (wished ? ' wished' : '')}
              onClick={() => ctx.notify(ctx.toggleWishlist(product) ? 'Đã thêm vào yêu thích' : 'Đã bỏ khỏi yêu thích', 'info')}
              aria-label="Yêu thích" title="Yêu thích"
            ><FiHeart /></button>
            <button className="btn btn-icon" onClick={share} aria-label="Chia sẻ" title="Sao chép liên kết"><FiShare2 /></button>
          </div>

          <ul className="policies">
            <li><FiTruck /> Miễn phí giao hàng toàn quốc</li>
            <li><FiShield /> Bảo hành chính hãng 12 tháng</li>
            <li><FiRefreshCw /> 1 đổi 1 trong 30 ngày nếu lỗi nhà sản xuất</li>
          </ul>
        </div>
      </div>

      <section className="detail-tabs">
        <div className="tabs">
          <button className={tab === 'desc' ? 'active' : ''} onClick={() => setTab('desc')}>Mô tả sản phẩm</button>
          <button className={tab === 'spec' ? 'active' : ''} onClick={() => setTab('spec')}>Thông tin chung</button>
        </div>
        {tab === 'desc' ? (
          <div className="tab-body">
            <p>{product.description || 'Sản phẩm chính hãng, nguyên seal, đầy đủ phụ kiện và hoá đơn VAT.'}</p>
            <p className="muted">SkyShop cam kết hàng chính hãng 100%, hỗ trợ trả góp và giao hàng tận nơi.</p>
          </div>
        ) : (
          <table className="spec-table">
            <tbody>
              <tr><th>Tên sản phẩm</th><td>{product.name}</td></tr>
              <tr><th>Danh mục</th><td>{product.category ? product.category.name : '—'}</td></tr>
              <tr><th>Giá bán</th><td>{formatVND(product.price)}</td></tr>
              <tr><th>Mã sản phẩm</th><td className="mono">{product._id}</td></tr>
              <tr><th>Ngày lên kệ</th><td>{formatDate(product.cdate, false)}</td></tr>
            </tbody>
          </table>
        )}
      </section>

      {(related === null || related.length > 0) && (
        <section className="section">
          <div className="section-head"><h2>Sản phẩm liên quan</h2></div>
          <div className="product-grid">
            {related === null ? <ProductGridSkeleton count={4} /> : related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
