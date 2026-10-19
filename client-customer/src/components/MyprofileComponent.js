import React, { useContext, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff, FiPackage, FiHeart, FiShoppingCart } from 'react-icons/fi';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';
import { authConfig, formatVND } from '../utils/format';

function Myprofile() {
  const ctx = useContext(MyContext);
  const { token, customer } = ctx;
  const [form, setForm] = useState({ username: '', password: '', name: '', phone: '', email: '' });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ orders: 0, spent: 0 });

  useEffect(() => {
    if (!customer) return;
    setForm({
      username: customer.username || '', password: customer.password || '',
      name: customer.name || '', phone: customer.phone || '', email: customer.email || ''
    });
    axios.get('/api/customer/orders/customer/' + customer._id, authConfig(token))
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setStats({
          orders: list.length,
          spent: list.filter((o) => o.status === 'APPROVED').reduce((s, o) => s + o.total, 0)
        });
      })
      .catch(() => {});
  }, [customer, token]);

  if (token === '' || !customer) return <Navigate replace to="/login" state={{ from: '/myprofile' }} />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = (e) => {
    e.preventDefault();
    const { username, password, name, phone, email } = form;
    if (!username || !password || !name || !phone || !email) {
      ctx.notify('Vui lòng nhập đầy đủ thông tin', 'error');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      ctx.notify('Email không hợp lệ', 'error');
      return;
    }
    setSaving(true);
    axios.put('/api/customer/customers/' + customer._id, form, authConfig(token))
      .then((res) => {
        if (res.data && res.data._id) {
          ctx.setCustomer(res.data);
          ctx.notify('Đã cập nhật thông tin tài khoản');
        } else {
          ctx.notify((res.data && res.data.message) || 'Cập nhật thất bại', 'error');
        }
      })
      .catch(() => ctx.notify('Không kết nối được server', 'error'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="container profile">
      <div className="page-title"><h1>Tài khoản của tôi</h1></div>
      <div className="profile-layout">
        <aside className="card profile-card">
          <div className="avatar xl">{(customer.name || '?').trim().charAt(0).toUpperCase()}</div>
          <h3>{customer.name}</h3>
          <p className="muted">@{customer.username}</p>
          <div className="profile-stats">
            <div><b>{stats.orders}</b><span>Đơn hàng</span></div>
            <div><b>{formatVND(stats.spent)}</b><span>Đã chi tiêu</span></div>
          </div>
          <div className="profile-links">
            <Link to="/myorders"><FiPackage /> Đơn hàng của tôi</Link>
            <Link to="/wishlist"><FiHeart /> Yêu thích ({ctx.wishlist.length})</Link>
            <Link to="/mycart"><FiShoppingCart /> Giỏ hàng ({CartUtil.getCount(ctx.mycart)})</Link>
          </div>
        </aside>

        <form className="card form-card" onSubmit={save}>
          <h3>Thông tin cá nhân</h3>
          <div className="form-grid">
            <label className="field"><span>Tên tài khoản</span><input value={form.username} onChange={set('username')} autoComplete="username" /></label>
            <label className="field">
              <span>Mật khẩu</span>
              <div className="input-icon">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} autoComplete="current-password" />
                <button type="button" className="icon-btn" onClick={() => setShowPw(!showPw)} aria-label="Hiện mật khẩu">{showPw ? <FiEyeOff /> : <FiEye />}</button>
              </div>
            </label>
            <label className="field"><span>Họ và tên</span><input value={form.name} onChange={set('name')} /></label>
            <label className="field"><span>Số điện thoại</span><input type="tel" value={form.phone} onChange={set('phone')} /></label>
            <label className="field full"><span>Email</span><input type="email" value={form.email} onChange={set('email')} /></label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
        </form>
      </div>
    </div>
  );
}

export default Myprofile;
