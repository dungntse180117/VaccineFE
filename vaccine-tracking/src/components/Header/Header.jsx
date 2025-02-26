import React from 'react';
import './header.css';
import { Link } from 'react-router-dom';

const Header = () => {
  // Lấy thông tin người dùng từ localStorage
  const user = localStorage.getItem('user');
  const isLoggedIn = !!user; // Kiểm tra xem người dùng đã đăng nhập hay chưa

  const handleLogout = () => {
    // Xóa token và user khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Điều hướng người dùng về trang chủ hoặc trang đăng nhập
    window.location.href = '/'; // Hoặc history.push('/login') nếu bạn đang dùng useHistory
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
            // Hiển thị thông tin người dùng và nút Logout nếu đã đăng nhập
            <div className="user-profile">
              <Link to="/profile">
                {/* Thay đổi cách hiển thị thông tin người dùng tùy theo dữ liệu bạn có */}
                <span>{JSON.parse(user).name || JSON.parse(user).email}</span>
              </Link>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            // Hiển thị nút Login nếu chưa đăng nhập
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;