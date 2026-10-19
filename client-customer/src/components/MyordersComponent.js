import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { FiPackage, FiChevronDown, FiChevronUp, FiMapPin, FiPhone, FiUser, FiCreditCard } from 'react-icons/fi';
import MyContext from '../contexts/MyContext';
import { formatVND, formatDate, imgSrc, ORDER_STATUS, authConfig } from '../utils/format';

const TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'APPROVED', label: 'Đã duyệt' },
  { key: 'CANCELED', label: 'Đã huỷ' }
];

function StatusBadge({ status }) {
  const s = ORDER_STATUS[status] || { label: status, cls: '' };
  return <span className={'status ' + s.cls}>{s.label}</span>;
}

function Myorders() {
  const ctx = useContext(MyContext);
  const { token, customer, notify } = ctx;
  const [orders, setOrders] = useState(null);
  const [tab, setTab] = useState('ALL');
  const [openId, setOpenId] = useState(null);

  const load = useCallback(() => {
    if (!customer) return;
    axios.get('/api/customer/orders/customer/' + customer._id, authConfig(token))
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => { setOrders([]); notify('Không tải được đơn hàng', 'error'); });
  }, [customer, token, notify]);

  useEffect(() => { load(); }, [load]);

  if (token === '' || !customer) return <Navigate replace to="/login" state={{ from: '/myorders' }} />;

  const cancel = (order) => {
    if (!window.confirm('Bạn chắc chắn muốn huỷ đơn hàng này?')) return;
    axios.put('/api/customer/orders/cancel/' + order._id, { cid: customer._id }, authConfig(token))
      .then((res) => {
        if (res.data && res.data.success) { notify('Đã huỷ đơn hàng', 'info'); load(); }
        else notify((res.data && res.data.message) || 'Không huỷ được đơn', 'error');
      })
      .catch(() => notify('Không kết nối được server', 'error'));
  };

  const list = (orders || []).filter((o) => tab === 'ALL' || o.status === tab);
  const countOf = (k) => (orders || []).filter((o) => k === 'ALL' || o.status === k).length;

  return (
    <div className="container orders">
      <div className="page-title"><h1>Đơn hàng của tôi</h1></div>
      <div className="tabs pill">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label} <span className="count">{countOf(t.key)}</span>
          </button>
        ))}
      </div>

      {orders === null ? (
        <div className="card"><div className="sk-line" /><div className="sk-line w60" /></div>
      ) : list.length === 0 ? (
        <div className="empty">
          <FiPackage className="empty-icon" />
          <h3>Chưa có đơn hàng nào</h3>
          <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
        </div>
      ) : (
        list.map((o) => {
          const open = openId === o._id;
          const qty = o.items.reduce((s, it) => s + it.quantity, 0);
          return (
            <article key={o._id} className="card order">
              <header className="order-head" onClick={() => setOpenId(open ? null : o._id)}>
                <div>
                  <b>Đơn #{String(o._id).slice(-8).toUpperCase()}</b>
                  <span className="muted small"> · {formatDate(o.cdate)}</span>
                </div>
                <StatusBadge status={o.status} />
              </header>
              <div className="order-summary" onClick={() => setOpenId(open ? null : o._id)}>
                <div className="thumbs">
                  {o.items.slice(0, 4).map((it, i) => <img key={i} src={imgSrc(it.product && it.product.image)} alt="" />)}
                  {o.items.length > 4 && <span className="more">+{o.items.length - 4}</span>}
                </div>
                <div className="order-total">
                  <span className="muted small">{qty} sản phẩm</span>
                  <b>{formatVND(o.total)}</b>
                </div>
                <span className="icon-btn">{open ? <FiChevronUp /> : <FiChevronDown />}</span>
              </div>

              {open && (
                <div className="order-detail">
                  <table className="table">
                    <thead>
                      <tr><th>Sản phẩm</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr>
                    </thead>
                    <tbody>
                      {o.items.map((it, i) => (
                        <tr key={i}>
                          <td>
                            <div className="table-prod">
                              <img src={imgSrc(it.product && it.product.image)} alt="" />
                              {it.product ? <Link to={'/product/' + it.product._id}>{it.product.name}</Link> : '—'}
                            </div>
                          </td>
                          <td>{formatVND(it.product && it.product.price)}</td>
                          <td>{it.quantity}</td>
                          <td><b>{formatVND((it.product ? it.product.price : 0) * it.quantity)}</b></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {o.shipping && (
                    <div className="ship-info">
                      <span><FiUser /> {o.shipping.name}</span>
                      <span><FiPhone /> {o.shipping.phone}</span>
                      <span><FiMapPin /> {o.shipping.address}</span>
                      <span><FiCreditCard /> {o.shipping.payment === 'BANK' ? 'Chuyển khoản' : 'Thanh toán khi nhận hàng'}</span>
                      {o.shipping.note && <span className="muted">Ghi chú: {o.shipping.note}</span>}
                    </div>
                  )}
                  {o.status === 'PENDING' && (
                    <div className="order-actions">
                      <button className="btn btn-outline danger" onClick={() => cancel(o)}>Huỷ đơn hàng</button>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}

export default Myorders;
