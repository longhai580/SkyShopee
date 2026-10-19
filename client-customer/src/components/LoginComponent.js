import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import MyContext from '../contexts/MyContext';

function Login() {
  const ctx = useContext(MyContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state && location.state.from) || '/home';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Vui lòng nhập tên tài khoản và mật khẩu'); return; }
    setLoading(true);
    setError('');
    axios.post('/api/customer/login', { username, password })
      .then((res) => {
        const result = res.data;
        if (result.success === true) {
          ctx.setToken(result.token);
          ctx.setCustomer(result.customer);
          ctx.notify('Chào mừng ' + result.customer.name + '!');
          navigate(from, { replace: true });
        } else {
          setError(result.message);
        }
      })
      .catch(() => setError('Không kết nối được server'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Đăng nhập</h1>
        <p className="muted">Đăng nhập để đặt hàng và theo dõi đơn của bạn.</p>
        {error && <div className="alert error">{error}</div>}
        <label className="field">
          <span>Tên tài khoản</span>
          <div className="input-icon left">
            <FiUser />
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
          </div>
        </label>
        <label className="field">
          <span>Mật khẩu</span>
          <div className="input-icon left">
            <FiLock />
            <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <button type="button" className="icon-btn" onClick={() => setShowPw(!showPw)} aria-label="Hiện mật khẩu">{showPw ? <FiEyeOff /> : <FiEye />}</button>
          </div>
        </label>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          <FiLogIn /> {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
        <button type="button" className="demo-hint" onClick={() => { setUsername('demo'); setPassword('demo123'); }}>
          Dùng tài khoản dùng thử: <b>demo</b> / <b>demo123</b>
        </button>
        <p className="auth-foot">Chưa có tài khoản? <Link to="/signup">Đăng kí ngay</Link> · <Link to="/active">Kích hoạt</Link></p>
      </form>
    </div>
  );
}
export default Login;
