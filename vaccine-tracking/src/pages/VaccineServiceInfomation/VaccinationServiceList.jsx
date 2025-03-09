import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import {
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    CardActionArea,
    CircularProgress,
    Paper,
    Alert
} from '@mui/material';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import "./VaccinationServiceList.css";
import {
  getAllVaccinationServices,
} from "../../config/axios";

function VaccinationServiceList() {
    const [vaccinationServices, setVaccinationServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchVaccinationServices();
    }, []);

    const fetchVaccinationServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllVaccinationServices();
            setVaccinationServices(response.data);
        } catch (error) {
            console.error("Error fetching vaccination services:", error);
            setError("Có lỗi xảy ra khi lấy dữ liệu dịch vụ vaccine.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box>
                <Header />
                <Typography variant="h6" align="center">Đang tải...</Typography>
                <Footer />
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Header />
                <Typography variant="h6" color="error" align="center">{error}</Typography>
                <Footer />
            </Box>
        );
    }

    return (
        <Box>
            <Header />
            <Typography variant="h5" align="center" gutterBottom>Danh sách Gói Tiêm Chủng</Typography>
			<Paper className="vaccination-list-paper"> 
            <Grid container spacing={2} className="vaccinationservice-list-container">
                {vaccinationServices.map((service) => {
                    return (
                        <Grid item xs={12} sm={6} md={4} key={service.serviceID} className="vaccination-item">
                            <Card className="vaccination-service-card">
                                <CardActionArea component={Link} to={`/vaccinationservicedetail/${service.serviceID}`}>
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            {service.serviceName}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Loại: {service.categoryName}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Giá: {service.price} vnđ
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
			</Paper>
            <Footer />
        </Box>
    );
}

export default VaccinationServiceList;