import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import {
    getVaccinationId,
    getVaccinationImage,
    getDiseaseByVaccinationId
} from "../../config/axios";
import {
    Typography,
    Chip,
    Box,
    Grid,
    Paper,
    Divider
} from '@mui/material';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import "./VaccineDetail.css";
import NoImage from "../../assets/NoImage.png";

function VaccineDetail() {
    const { vaccinationId } = useParams();
    const [vaccine, setVaccine] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchVaccineDetails();
    }, [vaccinationId]);

    const fetchVaccineDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getVaccinationId(vaccinationId);
            if (response && response.data) {
                const vaccineData = response.data;
                const diseasesResponse = await getDiseaseByVaccinationId(vaccineData.vaccinationId);
                let imageResponse = null;
                try {
                    imageResponse = await getVaccinationImage(vaccineData.vaccinationId);
                } catch (imageError) {
                    console.warn(`Could not fetch image for vaccine ${vaccineData.vaccinationId}:`, imageError);
                }
                setVaccine({ ...vaccineData, diseases: diseasesResponse || [] });
                setImageUrl(imageResponse ? imageResponse.data : NoImage);
            } else {
                setError("Không thể tải thông tin chi tiết vaccine.");
            }
        } catch (error) {
            console.error("Error fetching vaccination details:", error);
            setError("Có lỗi xảy ra khi lấy dữ liệu vaccine.");
        } finally {
            setLoading(false);
        }
    };

    const getAgeUnitText = (ageUnitId) => {
        switch (ageUnitId) {
            case 1: return "ngày tuổi";
            case 2: return "tháng tuổi";
            case 3: return "năm tuổi";
            default: return "tuổi";
        }
    };

    const getIntervalUnitText = (unitId) => {
        switch (unitId) {
            case 1: return "ngày";
            case 2: return "tháng";
            case 3: return "năm";
            default: return "không xác định";
        }
    };

    if (loading) {
        return (
            <>
                <Header /> 
                <Box className="vaccine-detail-container">
                    <Typography variant="h6" align="center">Đang tải...</Typography>
                    <Footer />
                </Box>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header /> 
                <Box className="vaccine-detail-container">
                    <Typography variant="h6" color="error" align="center">{error}</Typography>
                    <Footer />
                </Box>
            </>
        );
    }

    if (!vaccine) {
        return (
            <>
                <Header />
                <Typography variant="h6" align="center">Không tìm thấy vaccine.</Typography>
            </>
        );
    }

    const ageUnitText = getAgeUnitText(vaccine.ageUnitId);
    const intervalUnitText = getIntervalUnitText(vaccine.unitId);

    return (
        <>
            <Header /> {/* Tách Header ra khỏi Box để full-width */}
            <Box className="vaccine-detail-container">
                <Grid container spacing={2} padding={3} justifyContent="center">
                    <Grid item xs={12} md={10}>
                        <Paper className="vaccine-detail-paper" elevation={3}>
                            <Box className="detail-content-container">
                                <Box className="image-container">
                                    <img
                                        src={imageUrl}
                                        alt={vaccine.vaccinationName}
                                        className="vaccine-detail-image"
                                    />
                                </Box>
                                <Box className="info-container">
                                    <Typography variant="h4" className="vaccine-detail-header">
                                        {vaccine.vaccinationName}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body1" className="vaccine-detail-info">
                                        Nhà sản xuất: <strong>{vaccine.manufacturer}</strong>
                                    </Typography>
                                    <Typography variant="body1" className="vaccine-detail-info">
                                        Số mũi tiêm: <strong>{vaccine.totalDoses}</strong>
                                    </Typography>
                                    <Typography variant="body1" className="vaccine-detail-info">
                                        Khoảng cách giữa các mũi: <strong>{vaccine.interval} {intervalUnitText}</strong>
                                    </Typography>
                                    <Typography variant="body1" className="vaccine-detail-info">
                                        Giá: <strong>{vaccine.price.toLocaleString()}</strong> vnđ
                                    </Typography>
                                    <Typography variant="body1" className="vaccine-detail-info">
                                        Mô tả: {vaccine.description}
                                    </Typography>
                                    <Typography variant="body1" className="vaccine-detail-info">
                                        Độ tuổi phù hợp: {vaccine.minAge} - {vaccine.maxAge} {ageUnitText}
                                    </Typography>
                                    <Box className="vaccine-detail-diseases">
                                        <Typography variant="h6">Phòng bệnh:</Typography>
                                        {vaccine.diseases && vaccine.diseases.length > 0 ? (
                                            vaccine.diseases.map((disease) => (
                                                <Chip
                                                    key={disease.diseaseId}
                                                    label={disease.diseaseName}
                                                    className="disease-chip"
                                                />
                                            ))
                                        ) : (
                                            <Typography className="no-diseases">Không có bệnh liên quan</Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
                <Footer />
            </Box>
        </>
    );
}

export default VaccineDetail;