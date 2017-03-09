import React, { Component } from 'react';
import toastr from 'toastr';

export default class LoginBox extends Component {
  constructor(props) {
    super(props);

    toastr.options.preventDuplicates = true;

    this.goToSignup = this.goToSignup.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  goToSignup(e) {
    e.preventDefault();

    const { toggleState } = this.props;
    toggleState();
  }

  handleLogin(e) {
    e.preventDefault();
    const { login, validateEmail } = this.props;

    const email = this.refs.email.value.trim().toLowerCase();
    const password = this.refs.password.value;

    if (email.length === 0 || password.length === 0) {
      toastr.error('All fields must be filled.');
      return
    }

    if (!validateEmail(email)) {
      toastr.error("Invalid email address.");
      return
    }

    if (password.length < 3) {
      toastr.error("Invalid password.");
      return
    }

    let user = {
      email,
      password
    }

    login(user);
  }

  render() {
    const { isLoading } = this.props;

    return(
      <div className="login-box">
        <form onSubmit={this.handleLogin}>
          <div className="login-input-div">
            <p className="login-tag">EMAIL</p>
            <div className="input-group">
              <div className="input-group-addon login-icon"><i className="fa fa-envelope"></i></div>
              <input type="email" className="form-control login-input" ref="email"/>
            </div>
          </div>
          <div className="login-input-div">
            <p className="login-tag">PASSWORD</p>
            <div className="input-group">
              <div className="input-group-addon login-icon"><i className="fa fa-key"></i></div>
              <input type="password" className="form-control login-input" ref="password"/>
            </div>
          </div>
          <div className="lb-div">
            {isLoading &&
              <a href="#" className="btn play-btn logbtn downloading">Login <i className="fa fa-spinner fa-pulse fa-fw"></i></a>
            }
            {!isLoading &&
              <a href="#" className="btn play-btn logbtn" onClick={this.handleLogin}>Login</a>
            }
            <input className="hidden" type="submit" value="Submit" onSubmit={this.handleLogin}/>
          </div>
        </form>
        <p className="switch-p">New to alpha Stage? <a href="#" className="switch-ls" onClick={this.goToSignup}>Sign up now!</a></p>
      </div>
    )
  }
}
