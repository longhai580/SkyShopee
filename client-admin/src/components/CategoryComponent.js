import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CategoryDetail from './CategoryDetailComponent';

class Category extends Component {
  static contextType = MyContext; // using this.context to access global state
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      itemSelected: null
    };
  }
  render() {
    const cates = this.state.categories.map((item) => {
      const isSelected = this.state.itemSelected && this.state.itemSelected._id === item._id;
      return (
        <tr
          key={item._id}
          className={isSelected ? 'datatable admin-table-row is-selected' : 'datatable admin-table-row'}
          onClick={() => this.trItemClick(item)}
        >
          <td className="admin-id">{item._id}</td>
          <td>{item.name}</td>
        </tr>
      );
    });
    return (
      <div className="admin-page admin-page-grid admin-page-grid--compact">
        <section className="admin-panel admin-panel--table">
          <div className="admin-panel-head">
            <div>
              <p className="admin-kicker">Catalog</p>
              <h2 className="admin-heading">Categories</h2>
              <p className="admin-subtitle">{this.state.categories.length} storefront groups are ready to organize products.</p>
            </div>
            <span className="admin-badge">{this.state.categories.length} total</span>
          </div>
          <div className="admin-table-wrap">
            <table className="datatable admin-table">
              <tbody>
                <tr className="datatable">
                  <th>ID</th>
                  <th>Name</th>
                </tr>
                {cates}
              </tbody>
            </table>
          </div>
        </section>
        <CategoryDetail item={this.state.itemSelected} updateCategories={this.updateCategories} />
      </div>
    );    
  }
  updateCategories = (categories) => { // arrow-function
    this.setState({ categories: categories });
    } 
  componentDidMount() {
    this.apiGetCategories();
  }
  // event-handlers
  trItemClick(item) {
    this.setState({ itemSelected: item });
  }
  // apis
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      const result = res.data;
      this.setState({ categories: result });
    });
  }
}
export default Category;
