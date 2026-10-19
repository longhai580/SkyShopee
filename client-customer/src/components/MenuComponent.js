import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { FiGrid } from 'react-icons/fi';
import { CategoryIcon } from '../utils/format';

// Thanh danh mục sản phẩm
function CategoryNav() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('/api/customer/categories')
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <nav className="cat-nav" aria-label="Danh mục">
      <div className="container cat-nav-inner">
        <NavLink to="/products" className="cat-link">
          <FiGrid /> Tất cả
        </NavLink>
        {categories.map((c) => (
          <NavLink key={c._id} to={'/product/category/' + c._id} className="cat-link">
            <CategoryIcon name={c.name} /> {c.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default CategoryNav;
