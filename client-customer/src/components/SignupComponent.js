import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiLock, FiPhone, FiMail, FiSmile, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import MyContext from '../contexts/MyContext';

function Signup() {
  const ctx = useContext(MyContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', name: '', phone: '', email: '' });
  const [agree, setAgree] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const { username, password, name, phone, email } = form;
    if (!username || !password || !name || !phone || !email) return setError('Vui lòng nhập đầy đủ thông tin');
    if (password.length < 3) return setError('Mật khẩu tối thiểu 3 ký tự');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Email không hợp lệ');
    if (!/^[0-9+\s.]{8,15}$/.test(phone)) return setError('Số điện thoại không hợp lệ');
    if (!agree) return setError('Bạn cần đồng ý với điều khoản');
    setError('');
    setLoading(true);
    axios.post('/api/customer/signup', form)
      .then((res) => {
        if (res.data.success) setDone(res.data);
        else setError(res.data.message);
      })
      .catch(() => setError('Không kết nối được server'))
      .finally(() => setLoading(false));
  };

  if (done) {
    return (
      <div className="auth">
        <div className="card auth-card center">
          <FiCheckCircle className="success-icon" />
          <h1>Đăng kí thành công</h1>
          <p className="muted">{done.message}</p>
          {done.emailFailed && (
            <div className="code-box">
              <div><span>ID</span><code>{done.id}</code></div>
              <div><span>Token</span><code>{done.token}</code></div>
            </div>
          )}
          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate('/active', { state: { id: done.id || '', token: done.token || '' } })}
          >Kích hoạt tài khoản</button>
          {done.emailFailed && <p className="small muted">Mẹo: nút trên sẽ tự điền sẵn ID và Token.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Tạo tài khoản</h1>
        <p className="muted">Mua sắm nhanh hơn, theo dõi đơn hàng dễ dàng.</p>
        {error && <div className="alert error">{error}</div>}
        <div className="form-grid">
          <label className="field"><span>Tên tài khoản</span>
            <div className="input-icon left"><FiUser /><input value={form.username} onChange={set('username')} autoComplete="username" /></div>
          </label>
          <label className="field"><span>Mật khẩu</span>
            <div className="input-icon left"><FiLock />
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} autoComplete="new-password" />
              <button type="button" className="icon-btn" onClick={() => setShowPw(!showPw)} aria-label="Hiện mật khẩu">{showPw ? <FiEyeOff /> : <FiEye />}</button>
            </div>
          </label>
          <label className="field full"><span>Họ và tên</span>
            <div className="input-icon left"><FiSmile /><input value={form.name} onChange={set('name')} /></div>
          </label>
          <label className="field"><span>Số điện thoại</span>
            <div className="input-icon left"><FiPhone /><input type="tel" value={form.phone} onChange={set('phone')} /></div>
          </label>
          <label className="field"><span>Email</span>
            <div className="input-icon left"><FiMail /><input type="email" value={form.email} onChange={set('email')} /></div>
          </label>
        </div>
        <label className="checkbox">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật
        </label>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>{loading ? 'Đang xử lý…' : 'Đăng kí'}</button>
        <p className="auth-foot">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
        {ctx.token && <p className="small muted">Bạn đang đăng nhập với tài khoản {ctx.customer && ctx.customer.username}.</p>}
      </form>
    </div>
  );
}
export default Signup;
