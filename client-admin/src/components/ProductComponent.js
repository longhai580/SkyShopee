import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import ProductDetail from './ProductDetailComponent';
import '../styles/product.css'
class Product extends Component {
  static contextType = MyContext; // using this.context to access global state
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      noPages: 0,
      curPage: 1,
      itemSelected: null
    };
  }
  render() {
    const prods = this.state.products.map((item) => {
      const isSelected = this.state.itemSelected && this.state.itemSelected._id === item._id;
      return (
        <tr
          key={item._id}
          className={isSelected ? 'datatable admin-table-row is-selected' : 'datatable admin-table-row'}
          onClick={() => this.trItemClick(item)}
        >
          <td className="admin-id">{item._id}</td>
          <td>{item.name}</td>
          <td className="admin-price">{item.price.toLocaleString()}đ</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>        
          <td>{item.category?.name}</td>
          <td><img className="admin-table-image" src={"data:image/jpg;base64," + item.image} alt="" /></td>
 
        </tr>
      );
    });
    const pagination = Array.from({ length: this.state.noPages }, (_, index) => {
      if ((index + 1) === this.state.curPage) {
        return (<span key={index} className="admin-page-link active">{index + 1}</span>);
      } else {
        return (<span key={index} className="admin-page-link" onClick={() => this.lnkPageClick(index + 1)}>{index + 1}</span>);
      }
    });
    return (
      <div className="admin-page admin-page-grid">
        <section className="admin-panel admin-panel--table">
          <div className="admin-panel-head">
            <div>
              <p className="admin-kicker">Inventory</p>
              <h2 className="admin-heading">Products</h2>
              <p className="admin-subtitle">Browse, edit, and expand the catalog without leaving this screen.</p>
            </div>
            <span className="admin-badge">{this.state.noPages} pages</span>
          </div>
          <div className="admin-table-wrap">
            <table className="datatable admin-table">
              <tbody>
                <tr className="datatable">
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Creation date</th>
                  <th>Category</th>
                  <th>Image</th>
                </tr>
                {prods}
              </tbody>
            </table>
          </div>
          <div className="admin-pagination">{pagination}</div>
        </section>
        <ProductDetail item={this.state.itemSelected} curPage={this.state.curPage} updateProducts={this.updateProducts} />
      </div>
    );
  }
  updateProducts = (products, noPages, curPage) => { // arrow-function
    this.setState({ products: products, noPages: noPages, curPage: curPage });
  }
  componentDidMount() {
    this.apiGetProducts(this.state.curPage);
  }
  // event-handlers
  lnkPageClick(index) {
    this.apiGetProducts(index);
  }
  trItemClick(item) {
    this.setState({ itemSelected: item });
  }
  // apis
  apiGetProducts(page) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/products?page=' + page, config).then((res) => {
      const result = res.data;
      this.setState({ products: result.products, noPages: result.noPages, curPage: result.curPage });
    });
  }
}
export default Product;
