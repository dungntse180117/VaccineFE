import React, { useEffect, useState } from 'react';
import './header.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyringe } from '@fortawesome/free-solid-svg-icons'; 

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
    localStorage.removeItem('accountId'); // Xóa accountId
    setIsLoggedIn(false);
    setUser(null);
    setRoleId(null);
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          {/* Make the logo a Link to the home page */}
          <Link to="/" className="logo-link">
            <img src="https://content.govdelivery.com/attachments/fancy_images/USVHA/2021/01/4005196/covid-vaccine-01_original.png" alt="Your Company Logo" />
          </Link>
        </div>
        <nav className="header-nav">
          <Link to="/">Home</Link> {/* Changed to Link */}
          <Link to="/vaccinelist">Danh mục vaccine</Link> {/* Changed to Link */}
          <Link to="/vaccinationservicelist">Danh sách các gói</Link> {/* Changed to Link */}
        </nav>
        <div className="header-login">
          {isLoggedIn ? (
            <div className="user-profile">
              {/* Nút Đăng ký tiêm với biểu tượng vaccine */}
              <Link to="/registration" className="register-button">
                <FontAwesomeIcon icon={faSyringe} /> Đăng ký tiêm
              </Link>

              {/* Phần tên người dùng và dropdown menu */}
              <div className="username-dropdown">
                <span>{user?.name || user?.email || 'Unknown User'}</span>
                <div className="dropdown-menu">
                  <Link to="/profile">Profile</Link>
                  <Link to="/patientmanager">Hồ sơ tiêm chủng</Link>
                  {roleId === 1 && <Link to="/dashboard">Dashboard</Link>}
                  {roleId === 2 && <Link to="/registrationdetail">Quản lí đăng kí tiêm</Link>}
                </div>
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