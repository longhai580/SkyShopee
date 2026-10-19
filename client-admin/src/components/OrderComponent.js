import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Order extends Component {
  static contextType = MyContext; // using this.context to access global state
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      order: null
    };
  }
  render() {
    const orders = this.state.orders.map((item) => {
      const isSelected = this.state.order && this.state.order._id === item._id;
      return (
        <tr
          key={item._id}
          className={isSelected ? 'datatable admin-table-row is-selected' : 'datatable admin-table-row'}
          onClick={() => this.trItemClick(item)}
        >
          <td className="admin-id">{item._id}</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>
          <td>{item.customer.name}</td>
          <td>{item.customer.phone}</td>
          <td className="admin-price">{item.total.toLocaleString()}đ</td>
          <td><span className={'status-chip ' + item.status.toLowerCase()}>{item.status}</span></td>
          <td>
            {item.status === 'PENDING' ?
              <div className="admin-actions-inline"><span className="action-link approve" onClick={() => this.lnkApproveClick(item._id)}>Approve</span><span className="action-link cancel" onClick={() => this.lnkCancelClick(item._id)}>Cancel</span></div>
              : <div />}
          </td>
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
              <p className="admin-kicker">Orders</p>
              <h2 className="admin-heading">Order pipeline</h2>
              <p className="admin-subtitle">Track approvals, review totals, and inspect each basket in one place.</p>
            </div>
            <span className="admin-badge">{this.state.orders.length} total</span>
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
                  <th>Action</th>
                </tr>
                {orders}
              </tbody>
            </table>
          </div>
        </section>
        {this.state.order ?
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <p className="admin-kicker">Order detail</p>
                <h2 className="admin-heading">Selected basket</h2>
                <p className="admin-subtitle">Detailed line items for the current order.</p>
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
    this.apiGetOrders();
  }
  // event-handlers
  trItemClick(item) {
    this.setState({ order: item });
  }
  lnkApproveClick(id) {
    this.apiPutOrderStatus(id, 'APPROVED');
  }
  lnkCancelClick(id) {
    this.apiPutOrderStatus(id, 'CANCELED');
  }
  // apis
  apiGetOrders() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/orders', config).then((res) => {
      const result = res.data;
      this.setState({ orders: result });
    });
  }
  apiPutOrderStatus(id, status) {
    const body = { status: status };
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/orders/status/' + id, body, config).then((res) => {
      const result = res.data;
      if (result) {
        this.apiGetOrders();
      } else {
        alert('SORRY BABY!');
      }
    });
  }
}
export default Order;
