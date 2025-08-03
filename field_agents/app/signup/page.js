import React from 'react'
import './signup.css'

const SignupPage = () => {
  return (
    <div className="signup-container">
      <form className="signup-form">
        <h2 className="signup-title">Sign Up</h2>
        <input
          type="text"
          className="signup-input"
          placeholder="Username"
          required
        />
        <input
          type="email"
          className="signup-input"
          placeholder="Email"
          required
        />
        <input
          type="password"
          className="signup-input"
          placeholder="Password"
          required
        />
        <button type="submit" className="signup-btn">Register</button>
      </form>
    </div>
  )
}

export default SignupPage