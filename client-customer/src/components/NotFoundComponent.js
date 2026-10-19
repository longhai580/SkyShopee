import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container empty">
      <div className="big-404">404</div>
      <h3>Không tìm thấy trang</h3>
      <p className="muted">Đường dẫn có thể đã thay đổi hoặc không tồn tại.</p>
      <Link to="/home" className="btn btn-primary">Về trang chủ</Link>
    </div>
  );
}
export default NotFound;
