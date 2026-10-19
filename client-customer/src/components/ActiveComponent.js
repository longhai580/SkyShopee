import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiHash, FiKey, FiShieldOff, FiShield } from 'react-icons/fi';
import MyContext from '../contexts/MyContext';

function Active() {
  const ctx = useContext(MyContext);
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const init = location.state || {};
  const [id, setId] = useState(init.id || query.get('id') || '');
  const [token, setToken] = useState(init.token || query.get('token') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!id || !token) { setError('Vui lòng nhập ID và Token'); return; }
    setLoading(true);
    setError('');
    axios.post('/api/customer/active', { id: id.trim(), token: token.trim() })
      .then((res) => {
        if (res.data) {
          ctx.notify('Kích hoạt thành công! Mời bạn đăng nhập.');
          navigate('/login');
        } else {
          setError('ID hoặc Token không đúng');
        }
      })
      .catch(() => setError('Không kết nối được server'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={submit}>
        <h1><FiShield /> Kích hoạt tài khoản</h1>
        <p className="muted">Nhập ID và Token được gửi tới email khi bạn đăng kí.</p>
        {error && <div className="alert error"><FiShieldOff /> {error}</div>}
        <label className="field"><span>ID</span>
          <div className="input-icon left"><FiHash /><input value={id} onChange={(e) => setId(e.target.value)} /></div>
        </label>
        <label className="field"><span>Token</span>
          <div className="input-icon left"><FiKey /><input value={token} onChange={(e) => setToken(e.target.value)} /></div>
        </label>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>{loading ? 'Đang kích hoạt…' : 'Kích hoạt'}</button>
        <p className="auth-foot">Đã kích hoạt? <Link to="/login">Đăng nhập</Link></p>
      </form>
    </div>
  );
}
export default Active;
