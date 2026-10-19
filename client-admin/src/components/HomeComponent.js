import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Home extends Component {
  static contextType = MyContext; // using this.context to access global state
  constructor(props) {
    super(props);
    this.state = {
      categories: 0,
      products: 0,
      customers: 0,
      orders: 0,
      pendingOrders: 0
    };
  }
  render() {
    const stats = [
      { label: 'Categories', value: this.state.categories, accent: 'Emerald' },
      { label: 'Products', value: this.state.products, accent: 'Inventory' },
      { label: 'Customers', value: this.state.customers, accent: 'Audience' },
      { label: 'Pending Orders', value: this.state.pendingOrders, accent: 'Needs review' }
    ];

    return (
      <div className="admin-page">
        <div className="admin-hero">
          <section className="admin-panel hero-banner">
            <p className="admin-kicker">Dashboard</p>
            <h1 className="hero-title">A calmer admin space for catalog, orders, and customer follow-up.</h1>
            <p className="admin-subtitle">
              Everything below is live from your current MongoDB data, so this page doubles as a quick system check every time you sign in.
            </p>
            <div className="hero-tags">
              <span className="admin-badge">Storefront synced</span>
              <span className="admin-badge">Seed data active</span>
              <span className="admin-badge">Atlas online</span>
            </div>
          </section>
          <div className="admin-stat-grid">
            {stats.map((item) => (
              <section key={item.label} className="admin-panel admin-stat-card">
                <p className="admin-stat-label">{item.label}</p>
                <strong className="admin-stat-value">{item.value}</strong>
                <span className="admin-stat-note">{item.accent}</span>
              </section>
            ))}
          </div>
        </div>

        <div className="admin-page-grid admin-page-grid--compact">
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <p className="admin-kicker">Snapshot</p>
                <h2 className="admin-heading">What deserves attention today</h2>
                <p className="admin-subtitle">A tiny checklist to keep the back office moving.</p>
              </div>
            </div>
            <div className="admin-list">
              <div className="admin-list-item">
                <strong>{this.state.pendingOrders}</strong>
                <span>Orders are waiting for approval or cancelation.</span>
              </div>
              <div className="admin-list-item">
                <strong>{this.state.products}</strong>
                <span>Products are currently visible across your admin catalog.</span>
              </div>
              <div className="admin-list-item">
                <strong>{this.state.customers}</strong>
                <span>Customer accounts are available for order lookup and support.</span>
              </div>
            </div>
          </section>
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <p className="admin-kicker">Workflow</p>
                <h2 className="admin-heading">Quick routine</h2>
                <p className="admin-subtitle">A clean order for daily admin work.</p>
              </div>
            </div>
            <ol className="admin-steps">
              <li>Update categories first if a new product line is coming in.</li>
              <li>Add or revise products with fresh images and pricing.</li>
              <li>Review pending orders before checking customer activity.</li>
            </ol>
          </section>
        </div>
      </div>
    );
  }
  componentDidMount() {
    this.apiLoadDashboard();
  }
  async apiLoadDashboard() {
    const config = { headers: { 'x-access-token': this.context.token } };
    const [categoriesRes, customersRes, ordersRes, firstProductsRes] = await Promise.all([
      axios.get('/api/admin/categories', config),
      axios.get('/api/admin/customers', config),
      axios.get('/api/admin/orders', config),
      axios.get('/api/admin/products?page=1', config)
    ]);

    const firstProductsPage = firstProductsRes.data;
    let productCount = firstProductsPage.products.length;

    if (firstProductsPage.noPages > 1) {
      const lastProductsRes = await axios.get('/api/admin/products?page=' + firstProductsPage.noPages, config);
      productCount = ((firstProductsPage.noPages - 1) * 4) + lastProductsRes.data.products.length;
    }

    this.setState({
      categories: categoriesRes.data.length,
      products: productCount,
      customers: customersRes.data.length,
      orders: ordersRes.data.length,
      pendingOrders: ordersRes.data.filter((item) => item.status === 'PENDING').length
    });
  }
}
export default Home;
