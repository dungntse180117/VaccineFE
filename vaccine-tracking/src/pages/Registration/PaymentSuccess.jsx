import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../../components/Header/Header'; // Import Header
import Footer from '../../components/Footer/Footer'; // Import Footer
import { Box, Typography, Button } from '@mui/material'; // Import Material-UI components
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Import icon

const PaymentSuccess = () => {
    return (
        <Box className="payment-success-container">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '70vh',
                    textAlign: 'center',
                    padding: '20px',
                }}
            >
                {/* Success Icon */}
                <CheckCircleIcon
                    sx={{
                        fontSize: '80px',
                        color: 'green',
                        marginBottom: '20px',
                    }}
                />

                {/* Success Message */}
                <Typography variant="h4" gutterBottom>
                    Thanh toán thành công!
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
                </Typography>

                {/* Back to Home Button */}
                <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/"
                    sx={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        fontSize: '16px',
                    }}
                >
                    Quay lại trang chủ
                </Button>
            </Box>

            {/* Footer */}
            <Footer />
        </Box>
    );
};

export default PaymentSuccess;