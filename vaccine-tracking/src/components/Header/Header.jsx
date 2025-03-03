import React, { useEffect, useState } from 'react';
import './header.css';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    

    setIsLoggedIn(!!token);

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setRoleId(parsedUser.roleId); 
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('roleId');
    setIsLoggedIn(false);
    setUser(null);
    setRoleId(null);
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <img src="https://content.govdelivery.com/attachments/fancy_images/USVHA/2021/01/4005196/covid-vaccine-01_original.png" alt="Your Company Logo" />
        </div>
        <nav className="header-nav">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/services">Services</a>
          <a href="/contact">Contact</a>
        </nav>
        <div className="header-login">
          {isLoggedIn ? (
            <div className="user-profile">
              <span>{user?.name || user?.email || 'Unknown User'}</span>
              <div className="dropdown-menu">
                <Link to="/profile">Profile</Link>
                <Link to="/childProfile">Child Profile</Link>
                {roleId === 1 && <Link to="/dashboard">Dashboard</Link>}

              </div>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;