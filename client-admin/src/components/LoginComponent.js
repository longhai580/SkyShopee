import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import '../styles/login.css'
class Login extends Component {
  static contextType = MyContext; // using this.context to access global state
  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: ''
    };
  }
  render() {
    if (this.context.token === '') {
      return (
        <div className="login-screen">
          <div className="login-card">
            <div className="login-copy">
              <p className="admin-kicker admin-kicker-light">SkyShop Control Room</p>
              <h1>Run the store from one clean admin dashboard.</h1>
              <p>
                Keep products fresh, manage categories, approve orders, and stay on top
                of customer activity without hopping between cluttered screens.
              </p>
              <div className="login-credential">
                <span>Demo credentials</span>
                <strong>admin / admin123</strong>
              </div>
              <div className="login-points">
                <span>Catalog ready</span>
                <span>Order workflow</span>
                <span>Atlas connected</span>
              </div>
            </div>
            <div className="login-form-wrap">
              <div>
                <p className="admin-kicker">Welcome back</p>
                <h2 className="login-title">Sign in to continue</h2>
                <p className="admin-subtitle">Use your admin account to access the dashboard.</p>
              </div>
              <form className="admin-form">
                <div className="admin-field">
                  <span>Username</span>
                  <input
                    className="admin-input"
                    type="text"
                    value={this.state.txtUsername}
                    onChange={(e) => { this.setState({ txtUsername: e.target.value }) }}
                    placeholder="Enter admin username"
                  />
                </div>
                <div className="admin-field">
                  <span>Password</span>
                  <input
                    className="admin-input"
                    type="password"
                    value={this.state.txtPassword}
                    onChange={(e) => { this.setState({ txtPassword: e.target.value }) }}
                    placeholder="Enter password"
                  />
                </div>
                <button className='admin-button login-button' type="submit" onClick={(e) => this.btnLoginClick(e)}>
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }
    return (<div />);
  }
  // event-handlers
  btnLoginClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername;
    const password = this.state.txtPassword;
    if (username && password) {
      const account = { username: username, password: password };
      this.apiLogin(account);
    } else {
      alert('Please input username and password');
    }
  }
  // apis
  apiLogin(account) {
    axios.post('/api/admin/login', account).then((res) => {
      const result = res.data;
      if (result.success === true) {
        this.context.setToken(result.token);
        this.context.setUsername(account.username);
      } else {
        alert(result.message);
      }
    });
  }
}
export default Login;
