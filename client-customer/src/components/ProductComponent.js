import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FiFilter, FiX, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import ProductCard, { ProductGridSkeleton } from './ProductCard';
import { CategoryIcon, PRICE_RANGES, SORTS } from '../utils/format';

const PAGE_SIZE = 12;

function Pagination({ cur, total, onChange }) {
  if (total <= 1) return null;
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - cur) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return (
    <nav className="pagination" aria-label="Phân trang">
      <button disabled={cur <= 1} onClick={() => onChange(cur - 1)} aria-label="Trang trước"><FiChevronLeft /></button>
      {pages.map((p, i) => (p === '…'
        ? <span key={'e' + i} className="dots">…</span>
        : <button key={p} className={p === cur ? 'active' : ''} onClick={() => onChange(p)}>{p}</button>))}
      <button disabled={cur >= total} onClick={() => onChange(cur + 1)} aria-label="Trang sau"><FiChevronRight /></button>
    </nav>
  );
}

function Product() {
  const { cid, keyword } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get('sort') || 'newest';
  const priceKey = searchParams.get('price') || '';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ products: [], total: 0, noPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    axios.get('/api/customer/categories').then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => { setShowFilter(false); }, [cid, keyword, priceKey]);

  useEffect(() => {
    const range = PRICE_RANGES.find((r) => r.key === priceKey);
    const params = { sort, page, size: PAGE_SIZE };
    if (cid) params.cid = cid;
    if (keyword) params.q = keyword;
    if (range) {
      if (range.min != null) params.min = range.min;
      if (range.max != null) params.max = range.max;
    }
    setLoading(true);
    setError('');
    axios.get('/api/customer/products', { params })
      .then((res) => setData(res.data && res.data.products ? res.data : { products: [], total: 0, noPages: 1 }))
      .catch(() => setError('Không tải được sản phẩm. Kiểm tra server Node (cổng 3000) đã chạy chưa.'))
      .finally(() => setLoading(false));
  }, [cid, keyword, sort, priceKey, page]);

  const category = useMemo(() => categories.find((c) => c._id === cid), [categories, cid]);
  const title = keyword ? 'Kết quả cho “' + keyword + '”' : category ? category.name : cid ? 'Danh mục' : 'Tất cả sản phẩm';

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
    if (key === 'page') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const keepQuery = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    const s = next.toString();
    return s ? '?' + s : '';
  };

  return (
    <div className="container listing">
      <nav className="breadcrumb">
        <Link to="/home">Trang chủ</Link><span>/</span>
        {keyword ? <span>Tìm kiếm</span> : <Link to="/products">Sản phẩm</Link>}
        {category && (<><span>/</span><span>{category.name}</span></>)}
      </nav>

      <div className="listing-layout">
        <aside className={'filters' + (showFilter ? ' open' : '')}>
          <div className="filters-head">
            <h3>Bộ lọc</h3>
            <button className="icon-btn show-mobile" onClick={() => setShowFilter(false)} aria-label="Đóng"><FiX /></button>
          </div>
          <div className="filter-group">
            <h4>Danh mục</h4>
            <Link to={'/products' + keepQuery()} className={'filter-item' + (!cid && !keyword ? ' active' : '')}>Tất cả</Link>
            {categories.map((c) => (
              <Link key={c._id} to={'/product/category/' + c._id + keepQuery()} className={'filter-item' + (c._id === cid ? ' active' : '')}>
                <CategoryIcon name={c.name} /> {c.name}
              </Link>
            ))}
          </div>
          <div className="filter-group">
            <h4>Khoảng giá</h4>
            <label className="radio">
              <input type="radio" name="price" checked={!priceKey} onChange={() => setParam('price', '')} /> Tất cả
            </label>
            {PRICE_RANGES.map((r) => (
              <label key={r.key} className="radio">
                <input type="radio" name="price" checked={priceKey === r.key} onChange={() => setParam('price', r.key)} /> {r.label}
              </label>
            ))}
          </div>
        </aside>
        {showFilter && <div className="backdrop show-mobile" onClick={() => setShowFilter(false)} />}

        <section className="listing-main">
          <div className="listing-head">
            <div>
              <h1>{title}</h1>
              <p className="muted">{loading ? 'Đang tải…' : data.total + ' sản phẩm'}</p>
            </div>
            <div className="listing-tools">
              <button className="btn btn-outline show-mobile" onClick={() => setShowFilter(true)}><FiFilter /> Lọc</button>
              <label className="select">
                <span className="hide-sm">Sắp xếp:</span>
                <select value={sort} onChange={(e) => setParam('sort', e.target.value)}>
                  {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          {priceKey && (
            <div className="chips">
              <button className="chip" onClick={() => setParam('price', '')}>
                {(PRICE_RANGES.find((r) => r.key === priceKey) || {}).label} <FiX />
              </button>
            </div>
          )}

          {error && <div className="alert error">{error}</div>}

          {!loading && !error && data.products.length === 0 ? (
            <div className="empty">
              <FiSearch className="empty-icon" />
              <h3>Không tìm thấy sản phẩm phù hợp</h3>
              <p className="muted">Thử từ khoá khác hoặc bỏ bớt bộ lọc.</p>
              <Link to="/products" className="btn btn-primary">Xem tất cả sản phẩm</Link>
            </div>
          ) : (
            <div className="product-grid grid-3">
              {loading ? <ProductGridSkeleton count={6} /> : data.products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          <Pagination cur={data.curPage || page} total={data.noPages || 1} onChange={(p) => setParam('page', String(p))} />
        </section>
      </div>
    </div>
  );
}

export default Product;
