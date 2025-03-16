import React from 'react';
import { useLocation } from 'react-router-dom';

const PaymentSuccess = () => {

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Thanh toán thành công!</h1>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p> 
            <a href="/">Quay lại trang chủ</a>
        </div>
    );
};

export default PaymentSuccess;