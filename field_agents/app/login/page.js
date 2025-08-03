import React from 'react'
import './login.css'

const LoginPage = () => {
  return (
    <div className="login-container">
      <form className="login-form">
        <h2 className="login-title">Login</h2>
        <input
          type="text"
          className="login-input"
          placeholder="Username or Email"
          required
        />
        <input
          type="password"
          className="login-input"
          placeholder="Password"
          required
        />
        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  )
}

export default LoginPage