import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { getVaccinationServiceById } from "../../config/axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./VaccinationServiceDetail.css";

function VaccinationServiceDetail() {
  const { id } = useParams();
  const [vaccinationService, setVaccinationService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchVaccinationService();
    } else {
      setError("Không có ID dịch vụ vaccine.");
      setLoading(false);
    }
  }, [id]);

  const fetchVaccinationService = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getVaccinationServiceById(id);
      setVaccinationService(response.data);
    } catch (error) {
      console.error("Error fetching vaccination service:", error);
      setError("Có lỗi xảy ra khi lấy dữ liệu dịch vụ vaccine.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Header />
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Box>
        <Footer />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Header />
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
        <Footer />
      </Box>
    );
  }

  if (!vaccinationService) {
    return (
      <Box>
        <Header />
        <Typography variant="h6" align="center">
          Không tìm thấy dịch vụ vaccine.
        </Typography>
        <Footer />
      </Box>
    );
  }

  return (
    <Box>
      <Header />
      <Paper className="vaccination-service-detail-paper">
        <Grid container spacing={2}>
          {/* Thông tin gói vaccine (bên trái) */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" align="center" gutterBottom className="vaccination-service-detail-title">
              {vaccinationService.serviceName}
            </Typography>
            <Typography variant="body1">
              <strong>Loại:</strong> {vaccinationService.categoryName}
            </Typography>
            <Typography variant="body1">
              <strong>Số Mũi Tiêm:</strong> {vaccinationService.totalDoses}
            </Typography>
            <Typography variant="body1">
              <strong>Giá:</strong> {vaccinationService.price} vnđ
            </Typography>
            <Typography variant="body1">
              <strong>Mô tả:</strong> {vaccinationService.description}
            </Typography>
                {/* Hiển thị danh sách các bệnh phòng ngừa */}
                <Typography variant="subtitle1" mt={2}>
                  <strong>Phòng bệnh:</strong>
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {/* Lấy danh sách các bệnh duy nhất từ tất cả các vaccine */}
                  {[...new Set(vaccinationService.vaccinations.flatMap(v => v.diseases))].map((disease, index) => (
                    <Chip label={disease} key={index} size="small" />
                  ))}
                </Box>
          </Grid>

          {/* Danh sách vaccine (bên phải) */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom className="vaccination-service-detail-subtitle">
              Danh sách Vaccine
            </Typography>
            {vaccinationService.vaccinations && vaccinationService.vaccinations.length > 0 ? (
              <List>
                {vaccinationService.vaccinations.map((vaccine) => (
                  <ListItem key={vaccine.vaccinationId}>
                    <ListItemText
                      primary={vaccine.vaccinationName}
                      secondary={`Giá: ${vaccine.price} vnđ, Số mũi tiêm: ${vaccine.totalDoses}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2">Không có vaccine nào trong gói này.</Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
      <Footer />
    </Box>
  );
}

export default VaccinationServiceDetail;