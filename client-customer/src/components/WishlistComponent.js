import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import MyContext from '../contexts/MyContext';
import ProductCard from './ProductCard';

function Wishlist() {
  const { wishlist } = useContext(MyContext);
  if (wishlist.length === 0) {
    return (
      <div className="container empty">
        <FiHeart className="empty-icon" />
        <h3>Chưa có sản phẩm yêu thích</h3>
        <p className="muted">Bấm biểu tượng trái tim trên sản phẩm để lưu lại.</p>
        <Link to="/products" className="btn btn-primary">Khám phá sản phẩm</Link>
      </div>
    );
  }
  return (
    <div className="container section">
      <div className="page-title"><h1>Sản phẩm yêu thích <span className="muted">({wishlist.length})</span></h1></div>
      <div className="product-grid">
        {wishlist.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </div>
  );
}
export default Wishlist;
