import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import MyContext from '../contexts/MyContext';
import { formatVND, imgSrc, isNewProduct } from '../utils/format';

function ProductCard({ product }) {
  const ctx = useContext(MyContext);
  const wished = ctx.isWished(product._id);

  const add = () => {
    ctx.addToCart(product, 1);
    ctx.notify('Đã thêm “' + product.name + '” vào giỏ hàng');
  };
  const wish = () => {
    const added = ctx.toggleWishlist(product);
    ctx.notify(added ? 'Đã thêm vào yêu thích' : 'Đã bỏ khỏi yêu thích', 'info');
  };

  return (
    <article className="pcard">
      <div className="pcard-badges">
        {isNewProduct(product) && <span className="tag tag-new">Mới</span>}
        {product.sold > 0 && <span className="tag tag-hot">Bán chạy</span>}
      </div>
      <button className={'pcard-wish' + (wished ? ' active' : '')} onClick={wish} aria-label="Yêu thích" title="Yêu thích">
        <FiHeart />
      </button>
      <Link to={'/product/' + product._id} className="pcard-media">
        <img src={imgSrc(product.image)} alt={product.name} loading="lazy" />
      </Link>
      <div className="pcard-body">
        {product.category && <span className="pcard-cat">{product.category.name}</span>}
        <Link to={'/product/' + product._id} className="pcard-name">{product.name}</Link>
        <div className="pcard-price">{formatVND(product.price)}</div>
        <div className="pcard-foot">
          <span className="muted small">{product.sold > 0 ? 'Đã bán ' + product.sold : 'Hàng mới về'}</span>
          <button className="btn btn-sm btn-primary" onClick={add} aria-label={'Thêm ' + product.name + ' vào giỏ'}>
            <FiShoppingCart /> Thêm
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="pcard skeleton">
      <div className="pcard-media sk-block" />
      <div className="pcard-body">
        <div className="sk-line w40" />
        <div className="sk-line" />
        <div className="sk-line w60" />
      </div>
    </div>
  ));
}

export default ProductCard;
