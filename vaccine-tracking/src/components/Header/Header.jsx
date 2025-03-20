import React, { useEffect, useState } from 'react';
import './header.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyringe, faUser, faClipboardList, faTachometerAlt, faCalendarCheck, faHistory } from '@fortawesome/free-solid-svg-icons'; 

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [accountId, setAccountId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const storedAccountId = localStorage.getItem('accountId');

    setIsLoggedIn(!!token);
    setAccountId(storedAccountId);

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
    localStorage.removeItem('accountId');
    setIsLoggedIn(false);
    setUser(null);
    setRoleId(null);
    setAccountId(null);
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/" className="logo-link">
            <img src="https://content.govdelivery.com/attachments/fancy_images/USVHA/2021/01/4005196/covid-vaccine-01_original.png" alt="Your Company Logo" />
          </Link>
        </div>
        <nav className="header-nav">
          <Link to="/">Trang chủ</Link>
          <Link to="/vaccinelist">Danh mục vaccine</Link>
          <Link to="/vaccinationservicelist">Danh sách các gói</Link>
        </nav>
        <div className="header-login">
          {isLoggedIn ? (
            <div className="user-profile">
              <Link to="/registration" className="register-button">
                <FontAwesomeIcon icon={faSyringe} /> Đăng ký tiêm
              </Link>

              <div className="username-dropdown">
                <span>{user?.name || user?.email || 'Unknown User'}</span>
                <div className="dropdown-menu">
                  <Link to="/profile">
                    <FontAwesomeIcon icon={faUser} /> Profile
                  </Link>
                  <Link to="/patientmanager">
                    <FontAwesomeIcon icon={faClipboardList} /> Hồ sơ tiêm chủng
                  </Link>
                  {roleId === 1 && (
                    <Link to="/dashboard">
                      <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
                    </Link>
                  )}
                  {roleId === 2 && (
                    <Link to="/registrationdetail">
                      <FontAwesomeIcon icon={faCalendarCheck} /> Quản lí đăng kí tiêm
                    </Link>
                  )}
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