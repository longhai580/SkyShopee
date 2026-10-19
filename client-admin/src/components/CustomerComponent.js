import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Customer extends Component {
  static contextType = MyContext; // using this.context to access global state
  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      orders: [],
      order: null
    };
  }
  render() {
    const customers = this.state.customers.map((item) => {
      const isSelected = this.state.orders.length > 0 && this.state.orders[0].customer._id === item._id;
      return (
        <tr
          key={item._id}
          className={isSelected ? 'datatable admin-table-row is-selected' : 'datatable admin-table-row'}
          onClick={() => this.trCustomerClick(item)}
        >
          <td className="admin-id">{item._id}</td>
          <td>{item.username}</td>
          <td>{item.password}</td>
          <td>{item.name}</td>
          <td>{item.phone}</td>
          <td>{item.email}</td>
          <td><span className={item.active === 1 ? 'status-chip approved' : 'status-chip canceled'}>{item.active === 1 ? 'ACTIVE' : 'INACTIVE'}</span></td>
          <td>
            {item.active === 0 ?
              <span className="action-link approve" onClick={() => this.lnkEmailClick(item)}>Email</span>
              :
              <span className="action-link cancel" onClick={() => this.lnkDeactiveClick(item)}>Deactivate</span>}
          </td>
        </tr>
      );
    });
    const orders = this.state.orders.map((item) => {
      const isSelected = this.state.order && this.state.order._id === item._id;
      return (
        <tr
          key={item._id}
          className={isSelected ? 'datatable admin-table-row is-selected' : 'datatable admin-table-row'}
          onClick={() => this.trOrderClick(item)}
        >
          <td className="admin-id">{item._id}</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>
          <td>{item.customer.name}</td>
          <td>{item.customer.phone}</td>
          <td className="admin-price">{item.total.toLocaleString()}đ</td>
          <td><span className={'status-chip ' + item.status.toLowerCase()}>{item.status}</span></td>
        </tr>
      );
    });
    if (this.state.order) {
      var items = this.state.order.items.map((item, index) => {
        return (
          <tr key={item.product._id} className="datatable admin-table-row">
            <td>{index + 1}</td>
            <td className="admin-id">{item.product._id}</td>
            <td>{item.product.name}</td>
            <td><img className="admin-table-image" src={"data:image/jpg;base64," + item.product.image} alt="" /></td>
            <td className="admin-price">{item.product.price.toLocaleString()}đ</td>
            <td>{item.quantity}</td>
            <td className="admin-price">{(item.product.price * item.quantity).toLocaleString()}đ</td>
          </tr>
        );
      });
    }
    return (
      <div className="admin-page">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <p className="admin-kicker">Customers</p>
              <h2 className="admin-heading">Customer directory</h2>
              <p className="admin-subtitle">Review accounts, deactivate access, and inspect each customer's orders.</p>
            </div>
            <span className="admin-badge">{this.state.customers.length} total</span>
          </div>
          <div className="admin-table-wrap">
            <table className="datatable admin-table">
              <tbody>
                <tr className="datatable">
                  <th>ID</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Active</th>
                  <th>Action</th>
                </tr>
                {customers}
              </tbody>
            </table>
          </div>
        </section>
        {this.state.orders.length > 0 ?
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <p className="admin-kicker">Customer orders</p>
                <h2 className="admin-heading">Recent order history</h2>
                <p className="admin-subtitle">Click an order row to inspect its exact line items.</p>
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="datatable admin-table">
                <tbody>
                  <tr className="datatable">
                    <th>ID</th>
                    <th>Creation date</th>
                    <th>Cust.name</th>
                    <th>Cust.phone</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                  {orders}
                </tbody>
              </table>
            </div>
          </section>
          : <div />}
        {this.state.order ?
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <p className="admin-kicker">Order detail</p>
                <h2 className="admin-heading">Basket contents</h2>
                <p className="admin-subtitle">The exact products included in the selected customer order.</p>
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="datatable admin-table">
                <tbody>
                  <tr className="datatable">
                    <th>No.</th>
                    <th>Prod.ID</th>
                    <th>Prod.name</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                  </tr>
                  {items}
                </tbody>
              </table>
            </div>
          </section>
          : <div />}
      </div>
    );
  }
  componentDidMount() {
    this.apiGetCustomers();
  }
  // event-handlers
  trCustomerClick(item) {
    this.setState({ orders: [], order: null });
    this.apiGetOrdersByCustID(item._id);
  }
  trOrderClick(item) {
    this.setState({ order: item });
  }
  lnkDeactiveClick(item) {
    this.apiPutCustomerDeactive(item._id, item.token);
  }
  lnkEmailClick(item) {
    this.apiGetCustomerSendmail(item._id);
  }
  // apis
  apiGetCustomers() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/customers', config).then((res) => {
      const result = res.data;
      this.setState({ customers: result });
    });
  }
  apiGetOrdersByCustID(cid) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/orders/customer/' + cid, config).then((res) => {
      const result = res.data;
      this.setState({ orders: result });
    });
  }
  apiPutCustomerDeactive(id, token) {
    const body = { token: token };
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/customers/deactive/' + id, body, config).then((res) => {
      const result = res.data;
      if (result) {
        this.apiGetCustomers();
      } else {
        alert('SORRY BABY!');
      }
    });
  }
  apiGetCustomerSendmail(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/customers/sendmail/' + id, config).then((res) => {
      const result = res.data;
      alert(result.message);
    });
  }
}
export default Customer;
