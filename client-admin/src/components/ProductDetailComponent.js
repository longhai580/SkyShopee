import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import '../styles/product_detail.css'

class ProductDetail extends Component {
  static contextType = MyContext; // using this.context to access global state
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtID: '',
      txtName: '',
      txtPrice: '',
      cmbCategory: '',
      imgProduct: ''
    };
  }
  render() {
    const cates = this.state.categories.map((cate) => {
      return (<option key={cate._id} value={cate._id}>{cate.name}</option>);
    });

    return (
      <section className="admin-panel admin-panel--form">
        <div className="admin-panel-head">
          <div>
            <p className="admin-kicker">Editor</p>
            <h2 className="admin-heading">{this.state.txtID ? 'Update Product' : 'Add Product'}</h2>
            <p className="admin-subtitle">Select a row to update an item or create a brand-new product for the storefront.</p>
          </div>
        </div>
        <form className="admin-form">
          <div className="admin-field">
            <span>ID</span>
            <input className="admin-input" type="text" value={this.state.txtID} onChange={(e) => { this.setState({ txtID: e.target.value }) }} readOnly={true} />
          </div>
          <div className="admin-field">
            <span>Name</span>
            <input className="admin-input" type="text" value={this.state.txtName} onChange={(e) => { this.setState({ txtName: e.target.value }) }} placeholder="Example: iPhone 16 128GB" />
          </div>
          <div className="admin-field">
            <span>Price</span>
            <input className="admin-input" type="text" value={this.state.txtPrice} onChange={(e) => { this.setState({ txtPrice: e.target.value }) }} placeholder="25000000" />
          </div>
          <div className="admin-field">
            <span>Image</span>
            <input className="admin-input admin-file" type="file" name="fileImage" accept="image/jpeg, image/png, image/gif" onChange={(e) => this.previewImage(e)} />
          </div>
          <div className="admin-field">
            <span>Category</span>
            <select className="admin-select" value={this.state.cmbCategory} onChange={(e) => { this.setState({ cmbCategory: e.target.value }) }}>{cates}</select>
          </div>
          <div className="admin-actions">
            <button className="admin-button" type="submit" onClick={(e) => this.btnAddClick(e)}>Add New</button>
            <button className="admin-button secondary" type="submit" onClick={(e) => this.btnUpdateClick(e)}>Update</button>
            <button className="admin-button danger" type="submit" onClick={(e) => this.btnDeleteClick(e)}>Delete</button>
          </div>
          <div className="admin-preview">
            {this.state.imgProduct ? <img src={this.state.imgProduct} alt="" /> : <div className="admin-empty">Choose an image to preview it here.</div>}
          </div>
        </form>
      </section>
    );
  }
  componentDidMount() {
    this.apiGetCategories();
  }
  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      if (this.props.item) {
        this.setState({
          txtID: this.props.item._id,
          txtName: this.props.item.name,
          txtPrice: this.props.item.price,
          cmbCategory: this.props.item.category._id,
          imgProduct: 'data:image/jpg;base64,' + this.props.item.image
        });
      } else {
        this.resetForm();
      }
    }
  }
  resetForm(categories = this.state.categories) {
    this.setState({
      txtID: '',
      txtName: '',
      txtPrice: '',
      cmbCategory: categories.length > 0 ? categories[0]._id : '',
      imgProduct: ''
    });
  }
  // event-handlers
  btnAddClick(e) {
    e.preventDefault();
    const name = this.state.txtName;
    const price = parseInt(this.state.txtPrice);
    const category = this.state.cmbCategory;
    const image = this.state.imgProduct.replace(/^data:image\/[a-z]+;base64,/, '');

    if (name && price && category && image) {
      const prod = { name: name, price: price, category: category, image: image };
      this.apiPostProduct(prod);
    } else {
      alert('Please input name and price and category and image');
    }
  }
  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = this.state.txtName;
    const price = parseInt(this.state.txtPrice);
    const category = this.state.cmbCategory;
    const image = this.state.imgProduct.replace(/^data:image\/[a-z]+;base64,/, '');

    if (id && name && price && category && image) {
      const prod = { name: name, price: price, category: category, image: image };
      this.apiPutProduct(id, prod);
    } else {
      alert('Please input id and name and price and category and image');
    }
  }
  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('ARE YOU SURE?')) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteProduct(id);
      } else {
        alert('Please input id');
      }
    }
  }
  previewImage(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.setState({ imgProduct: evt.target.result });
      }
      reader.readAsDataURL(file);
    }
  }
  // apis
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      const result = res.data;
      this.setState((prevState) => ({
        categories: result,
        cmbCategory: prevState.cmbCategory || (result.length > 0 ? result[0]._id : '')
      }));
    });
  }
  apiPostProduct(prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/products', prod, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('OK BABY!');
        this.resetForm();
        this.apiGetProducts();
      } else {
        alert('SORRY BABY!');
      }
    });
  }
  apiDeleteProduct(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/products/' + id, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('OK BABY!');
        this.resetForm();
        this.apiGetProducts();
      } else {
        alert('SORRY BABY!');
      }
    });
  }
  apiGetProducts() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/products?page=' + this.props.curPage, config).then((res) => {
      const result = res.data;
      if (result.products.length !== 0) {
        this.props.updateProducts(result.products, result.noPages, result.curPage);
      } else {
        const curPage = this.props.curPage - 1;
        axios.get('/api/admin/products?page=' + curPage, config).then((nextRes) => {
          const nextResult = nextRes.data;
          this.props.updateProducts(nextResult.products, nextResult.noPages, nextResult.curPage);
        });
      }
    });
  }
  apiPutProduct(id, prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/products/' + id, prod, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('OK BABY!');
        this.apiGetProducts();
      } else {
        alert('SORRY BABY!');
      }
    });
  }
}
export default ProductDetail;
