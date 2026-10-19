import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import '../styles/menu.css'
import { Link, NavLink } from 'react-router-dom';
class Menu extends Component {
  static contextType = MyContext; // using this.context to access global state
  render() {
    const navItems = [
      { to: '/admin/home', label: 'Dashboard' },
      { to: '/admin/category', label: 'Categories' },
      { to: '/admin/product', label: 'Products' },
      { to: '/admin/order', label: 'Orders' },
      { to: '/admin/customer', label: 'Customers' }
    ];

    return (
      <header className="admin-topbar">
        <Link to='/admin/home' className="admin-brand">
          <span className="admin-brand-mark">S</span>
          <span className="admin-brand-copy">
            <strong>SkyShop Admin</strong>
            <small>Back office dashboard</small>
          </span>
        </Link>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-user-panel">
          <span className="admin-user-meta">Signed in as</span>
          <strong className="admin-user-name">{this.context.username}</strong>
          <button className="admin-logout" type="button" onClick={() => this.lnkLogoutClick()}>
            Logout
          </button>
        </div>
      </header>
    );
  }
  // event-handlers
  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setUsername('');
  }
}
export default Menu;
