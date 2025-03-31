import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../../components/Header/Header'; 
import Footer from '../../components/Footer/Footer'; 
import { Box, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; 

const PaymentSuccess = () => {
    return (
        <Box className="payment-success-container">
  
            <Header />

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
                
                <CheckCircleIcon
                    sx={{
                        fontSize: '80px',
                        color: 'green',
                        marginBottom: '20px',
                    }}
                />

              
                <Typography variant="h4" gutterBottom>
                    Thanh toán thành công!
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
                </Typography>

                
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

            
            <Footer />
        </Box>
    );
};

export default PaymentSuccess;