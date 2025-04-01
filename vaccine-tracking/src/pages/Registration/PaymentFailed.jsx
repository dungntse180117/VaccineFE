import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header'; 
import Footer from '../../components/Footer/Footer'; 
import { Box, Typography, Button } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel'; 

const PaymentFailed = () => {
    return (
        <Box className="payment-failed-container">
 
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
             
                <CancelIcon
                    sx={{
                        fontSize: '80px',
                        color: 'red', 
                        marginBottom: '20px',
                    }}
                />

        
                <Typography variant="h4" gutterBottom>
                    Thanh toán thất bại!
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    Vui lòng thử lại hoặc liên hệ hỗ trợ.
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

export default PaymentFailed;