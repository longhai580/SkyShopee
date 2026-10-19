import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import MyContext from './MyContext';

// ---- localStorage an toàn (có thể bị chặn / đầy) ----
const LS = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* bỏ qua */ }
  }
};

// lưu bản gọn của sản phẩm cho wishlist / đã xem
const lite = (p) => ({ _id: p._id, name: p.name, price: p.price, image: p.image, cdate: p.cdate, category: p.category, sold: p.sold });

function MyProvider({ children }) {
  const [token, setToken] = useState(() => LS.get('sky_token', ''));
  const [customer, setCustomer] = useState(() => LS.get('sky_customer', null));
  const [mycart, setMycartState] = useState(() => LS.get('sky_cart', []));
  const [wishlist, setWishlist] = useState(() => LS.get('sky_wishlist', []));
  const [recent, setRecent] = useState(() => LS.get('sky_recent', []));
  const [theme, setTheme] = useState(() => LS.get('sky_theme', 'light'));
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  useEffect(() => { LS.set('sky_token', token); }, [token]);
  useEffect(() => { LS.set('sky_customer', customer); }, [customer]);
  useEffect(() => { LS.set('sky_cart', mycart); }, [mycart]);
  useEffect(() => { LS.set('sky_wishlist', wishlist); }, [wishlist]);
  useEffect(() => { LS.set('sky_recent', recent); }, [recent]);
  useEffect(() => {
    LS.set('sky_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const notify = useCallback((message, type = 'success') => {
    const id = ++toastId.current;
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  }, []);
  const dismissToast = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const logout = useCallback(() => {
    setToken('');
    setCustomer(null);
  }, []);

  // kiểm tra token đã lưu còn hạn không
  useEffect(() => {
    if (!token) return;
    axios.get('/api/customer/token', { headers: { 'x-access-token': token } })
      .then((res) => { if (!res.data || res.data.success !== true) logout(); })
      .catch(() => { /* server tắt: giữ nguyên */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- giỏ hàng ----
  const setMycart = useCallback((value) => setMycartState([...value]), []);
  const addToCart = useCallback((product, quantity = 1) => {
    setMycartState((cart) => {
      const index = cart.findIndex((x) => x.product._id === product._id);
      if (index === -1) return [...cart, { product, quantity }];
      return cart.map((x, i) => (i === index ? { ...x, quantity: x.quantity + quantity } : x));
    });
  }, []);
  const updateQuantity = useCallback((id, quantity) => {
    setMycartState((cart) => cart.map((x) => (x.product._id === id ? { ...x, quantity: Math.max(1, Math.min(99, quantity)) } : x)));
  }, []);
  const removeFromCart = useCallback((id) => {
    setMycartState((cart) => cart.filter((x) => x.product._id !== id));
  }, []);
  const clearCart = useCallback(() => setMycartState([]), []);

  // ---- yêu thích ----
  const isWished = useCallback((id) => wishlist.some((p) => p._id === id), [wishlist]);
  const toggleWishlist = useCallback((product) => {
    const exists = wishlist.some((p) => p._id === product._id);
    setWishlist((list) => {
      if (list.some((p) => p._id === product._id)) return list.filter((p) => p._id !== product._id);
      return [lite(product), ...list].slice(0, 50);
    });
    return !exists;
  }, [wishlist]);

  // ---- đã xem gần đây ----
  const addRecent = useCallback((product) => {
    setRecent((list) => [lite(product), ...list.filter((p) => p._id !== product._id)].slice(0, 8));
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo(() => ({
    token, customer, mycart, wishlist, recent, theme, toasts,
    setToken, setCustomer, setMycart, logout,
    addToCart, updateQuantity, removeFromCart, clearCart,
    isWished, toggleWishlist, addRecent, toggleTheme,
    notify, dismissToast
  }), [token, customer, mycart, wishlist, recent, theme, toasts, setMycart, logout, addToCart, updateQuantity,
    removeFromCart, clearCart, isWished, toggleWishlist, addRecent, toggleTheme, notify, dismissToast]);

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

export default MyProvider;
