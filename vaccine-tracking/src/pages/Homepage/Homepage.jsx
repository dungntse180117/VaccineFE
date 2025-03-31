import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CardMedia, CardActionArea, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { getAllVaccination, getVaccinationImage, getDiseaseByVaccinationId, getAllFeedbacks } from '../../config/axios';
import './HomePage.css';
import NoImage from "../../assets/NoImage.png";

const HomePage = () => {
    const [featuredVaccines, setFeaturedVaccines] = useState([]);
    const [allVaccinesForPriceTable, setAllVaccinesForPriceTable] = useState([]);
    const [approvedFeedbacks, setApprovedFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [selectedRating, setSelectedRating] = useState(5);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const vaccineResponse = await getAllVaccination();
                if (vaccineResponse && vaccineResponse.data && Array.isArray(vaccineResponse.data)) {
                    const allVaccinesData = vaccineResponse.data;
                    setAllVaccinesForPriceTable(allVaccinesData);

                    const vaccinesToFeature = allVaccinesData.slice(0, 6);

                    const featuredVaccinesWithData = await Promise.all(
                        vaccinesToFeature.map(async (vaccine) => {
                            try {
                                const diseasesResponse = await getDiseaseByVaccinationId(vaccine.vaccinationId);
                                let imageUrl = null;
                                try {
                                    const imageResponse = await getVaccinationImage(vaccine.vaccinationId);
                                    imageUrl = imageResponse.data ? imageResponse.data : null;
                                } catch (imageError) {
                                    console.warn(`Could not fetch image for vaccine ${vaccine.vaccinationId}:`, imageError);
                                }
                                return {
                                    ...vaccine,
                                    diseases: diseasesResponse || [],
                                    imageUrl: imageUrl || NoImage,
                                    price: vaccine.price || 'Giá chưa cập nhật',
                                    manufacturer: vaccine.manufacturer
                                };
                            } catch (diseaseError) {
                                console.error(`Error fetching data for vaccine ${vaccine.vaccinationId}:`, diseaseError);
                                return { ...vaccine, diseases: [], imageUrl: null, price: 'Giá chưa cập nhật', manufacturer: 'Không rõ' };
                            }
                        })
                    );
                    setFeaturedVaccines(featuredVaccinesWithData);
                } else {
                    setError("Không thể tải danh sách vaccine.");
                }

                const feedbackResponse = await getAllFeedbacks();
                if (feedbackResponse && Array.isArray(feedbackResponse)) {
                    const approved = feedbackResponse.filter(fb => fb.status === "Approved");
                    setApprovedFeedbacks(approved);
                    const initialFiltered = approved
                        .filter(fb => fb.rating === 5)
                        .sort((a, b) => new Date(b.feedbackDate) - new Date(a.feedbackDate));
                    setFilteredFeedbacks(initialFiltered);
                } else {
                    console.warn("Không thể tải danh sách phản hồi hoặc dữ liệu không hợp lệ.");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Có lỗi xảy ra khi lấy dữ liệu.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleStarClick = (rating) => {
        setSelectedRating(rating);
        const filtered = approvedFeedbacks.filter(
            (feedback) => feedback.rating === rating
        );
        const sortedFiltered = filtered.sort((a, b) => 
            new Date(b.feedbackDate) - new Date(a.feedbackDate)
        );
        setFilteredFeedbacks(sortedFiltered);
    };

    const getAgeUnitText = (ageUnitId) => {
        switch (ageUnitId) {
            case 1: return "ngày tuổi";
            case 2: return "tháng tuổi";
            case 3: return "năm tuổi";
            default: return "tuổi";
        }
    };

    const renderStars = (rating) => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {[...Array(5)].map((_, index) => (
                    <Star
                        key={index}
                        sx={{ color: index < rating ? '#f5c518' : '#e0e0e0', fontSize: '1.2rem' }}
                    />
                ))}
            </Box>
        );
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
        <Box className="home-page-container">
            <Header />

            <Box className="banner-container">
                <img src="https://res.cloudinary.com/dzxkl9am6/image/upload/v1742193045/BannerHomePage_ffuuhf.png" alt="Banner HomePage" className="banner-image" />
            </Box>

            <Box className="featured-vaccines-section">
                <Grid container alignItems="center" justifyContent="space-between" className="featured-vaccines-header">
                    <Grid item>
                        <Typography variant="h5" gutterBottom>
                            Vaccine Nổi Bật
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button variant="text" component={Link} to="/vaccinelist">
                            Xem thêm
                        </Button>
                    </Grid>
                </Grid>

                <Box className="featured-vaccines-wrapper">
                    <Grid container spacing={2} className="vaccine-grid">
                        {featuredVaccines.map((vaccine) => (
                            <Grid item xs={12} sm={6} md={3} key={vaccine.vaccinationId}>
                                <Card className="vaccination-card">
                                    <CardActionArea component={Link} to={`/vaccinedetail/${vaccine.vaccinationId}`}>
                                        <div className="images-container">
                                            {vaccine.imageUrl && (
                                                <CardMedia component="img" image={vaccine.imageUrl} alt={vaccine.vaccinationName} className="vaccination-image" />
                                            )}
                                        </div>
                                        <CardContent>
                                            <Typography variant="h6" component="div">
                                                {vaccine.vaccinationName}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Nhà sản xuất: {vaccine.manufacturer}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Số mũi tiêm: {vaccine.totalDoses}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Độ tuổi phù hợp: {vaccine.minAge} đến {vaccine.maxAge} {getAgeUnitText(vaccine.ageUnitId)}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>

            <Box className="vaccine-price-table-section">
                <Typography variant="h5" gutterBottom align="center">
                    Bảng Giá Tất Cả Vaccine
                </Typography>
                <TableContainer component={Paper} className="vaccine-price-table-wrapper">
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Tên Vaccine</TableCell>
                                <TableCell align="left">Nhà Sản Xuất</TableCell>
                                <TableCell align="left">Giá (VNĐ)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allVaccinesForPriceTable.map((vaccine) => (
                                <TableRow key={vaccine.vaccinationId}>
                                    <TableCell component="th" scope="row">{vaccine.vaccinationName}</TableCell>
                                    <TableCell align="left">{vaccine.manufacturer}</TableCell>
                                    <TableCell align="left">{vaccine.price}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Box className="feedback-section">
                <Typography variant="h5" gutterBottom align="center">
                    Phản Hồi Từ Khách Hàng
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <IconButton
                            key={star}
                            onClick={() => handleStarClick(star)}
                            sx={{ p: 0.5 }}
                        >
                            {star <= selectedRating ? (
                                <Star sx={{ color: '#f5c518' }} />
                            ) : (
                                <StarBorder sx={{ color: '#f5c518' }} />
                            )}
                        </IconButton>
                    ))}
                </Box>
                <Box className="feedback-wrapper">
                    {filteredFeedbacks.length > 0 ? (
                        filteredFeedbacks.map((feedback) => (
                            <Card key={feedback.feedbackId} className="feedback-card">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="h6" component="div">
                                            {feedback.accountName || "Ẩn danh"}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {renderStars(feedback.rating)}
                                            <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                                                {feedback.feedbackDate ? new Date(feedback.feedbackDate).toLocaleDateString("vi-VN") : "N/A"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body1">
                                        {feedback.comment || "Không có bình luận"}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Typography variant="body1" align="center">
                            Không có phản hồi nào phù hợp với số sao đã chọn.
                        </Typography>
                    )}
                </Box>
            </Box>
            <Footer />
        </Box>
    );
};

export default HomePage;