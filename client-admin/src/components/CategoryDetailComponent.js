import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class CategoryDetail extends Component {
  static contextType = MyContext; // using this.context to access global state
  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtName: ''
    };
  }
  render() {
    return (
      <section className="admin-panel admin-panel--form">
        <div className="admin-panel-head">
          <div>
            <p className="admin-kicker">Editor</p>
            <h2 className="admin-heading">{this.state.txtID ? 'Update Category' : 'Add Category'}</h2>
            <p className="admin-subtitle">Keep the storefront navigation tidy with short, clear category names.</p>
          </div>
        </div>
        <form className="admin-form">
          <div className="admin-field">
            <span>ID</span>
            <input className="admin-input" type="text" value={this.state.txtID} onChange={(e) => { this.setState({ txtID: e.target.value }) }} readOnly={true} />
          </div>
          <div className="admin-field">
            <span>Name</span>
            <input className="admin-input" type="text" value={this.state.txtName} onChange={(e) => { this.setState({ txtName: e.target.value }) }} placeholder="Example: iPhone" />
          </div>
          <div className="admin-actions">
            <button className="admin-button" type="submit" onClick={(e) => this.btnAddClick(e)}>Add New</button>
            <button className="admin-button secondary" type="submit" onClick={(e) => this.btnUpdateClick(e)}>Update</button>
            <button className="admin-button danger" type="submit" onClick={(e) => this.btnDeleteClick(e)}>Delete</button>
          </div>
        </form>
      </section>
    );
  }
  resetForm() {
    this.setState({ txtID: '', txtName: '' });
  }
  // event-handlers
  btnAddClick(e) {
    e.preventDefault();
    const name = this.state.txtName;
    if (name) {
      const cate = { name: name };
      this.apiPostCategory(cate);
    } else {
      alert('Please input name');
    }
  }
  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = this.state.txtName;
    if (id && name) {
      const cate = { name: name };
      this.apiPutCategory(id, cate);
    } else {
      alert('Please input id and name');
    }
  }
  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('ARE YOU SURE?')) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteCategory(id);
      } else {
        alert('Please input id');
      }
    }
  }
  // apis
  apiPostCategory(cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/categories', cate, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('OK BABY!');
        this.resetForm();
        this.apiGetCategories();
      } else {
        alert('SORRY BABY!');
      }
    });
  }
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      const result = res.data;
      this.props.updateCategories(result);
    });
  }
  apiDeleteCategory(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/categories/' + id, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('OK BABY!');
        this.resetForm();
        this.apiGetCategories();
      } else {
        alert('SORRY BABY!');
      }
    });
  }
  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      if (this.props.item) {
        this.setState({ txtID: this.props.item._id, txtName: this.props.item.name });
      } else {
        this.resetForm();
      }
    }
  }
  apiPutCategory(id, cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/categories/' + id, cate, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('OK BABY!');
        this.apiGetCategories();
      } else {
        alert('SORRY BABY!');
      }
    });
  }
}
export default CategoryDetail;
