import React from 'react';
import './Footer.css'; // Import the CSS file

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} Cơ sở tiêm vaccine.</p>
        <nav className="footer-nav">
          <a>Số điện liên hệ:03746681</a>
          <a >Email: vaccineforlife2025@gmail.com</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;