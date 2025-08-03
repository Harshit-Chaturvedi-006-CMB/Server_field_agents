import React from 'react'
import './navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar-ribbon">
      <div className="navbar-content">
        <img
          src="https://i.redd.it/w0lmb8i7odo51.png"
          alt="App Logo"
          className="navbar-logo"
        />
        <span className="navbar-title">
          Field Agents <span className="navbar-highlight">Shadow Protocol</span>
        </span>
      </div>
    </nav>
  )
}

export default Navbar