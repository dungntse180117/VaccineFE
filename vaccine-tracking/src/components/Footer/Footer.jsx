import React from 'react';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope,  } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <p>© {new Date().getFullYear()} Cơ sở tiêm vaccine.</p>
          <p className="tagline">Bảo vệ sức khỏe, an tâm tương lai.</p>
        </div>
        <nav className="footer-nav">
          <a href="tel:03746681">
            <FontAwesomeIcon icon={faPhone} /> Số điện liên hệ: 03746681
          </a>
          <a href="mailto:vaccineforlife2025@gmail.com">
            <FontAwesomeIcon icon={faEnvelope} /> Email: vaccineforlife2025@gmail.com
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;