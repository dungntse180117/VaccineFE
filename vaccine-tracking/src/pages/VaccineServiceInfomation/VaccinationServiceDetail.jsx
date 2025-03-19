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
      <Box sx={{ background: "#ecf0f1", minHeight: "100vh" }}>
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
      <Box sx={{ background: "#ecf0f1", minHeight: "100vh" }}>
        <Header />
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
        <Footer />
      </Box>
    );
  }

  if (!vaccinationService) {
    return (
      <Box sx={{ background: "#ecf0f1", minHeight: "100vh" }}>
        <Header />
        <Typography variant="h6" align="center" sx={{ p: 3 }}>
          Không tìm thấy dịch vụ vaccine.
        </Typography>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ background: "#ecf0f1", minHeight: "100vh" }}>
      <Header />
      <Paper className="vaccination-service-detail-paper" elevation={3}>
        <Grid container spacing={3}>
          {/* Thông tin gói vaccine (bên trái) */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" className="vaccination-service-detail-title">
              {vaccinationService.serviceName}
            </Typography>
            <Paper className="vaccination-info-paper" elevation={0}>
              <Typography variant="body1">
                <strong>Loại:</strong> {vaccinationService.categoryName}
              </Typography>
              <Typography variant="body1">
                <strong>Số mũi tiêm:</strong> {vaccinationService.totalDoses}
              </Typography>
              <Typography variant="body1">
                <strong>Giá:</strong> {vaccinationService.price.toLocaleString()} vnđ
              </Typography>
              <Typography variant="body1">
                <strong>Mô tả:</strong> {vaccinationService.description}
              </Typography>
            </Paper>
            {/* Hiển thị danh sách các bệnh phòng ngừa */}
            <Typography variant="subtitle1" mt={2}>
              <strong>Phòng bệnh:</strong>
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {[...new Set(vaccinationService.vaccinations.flatMap((v) => v.diseases))].map(
                (disease, index) => (
                  <Chip label={disease} key={index} size="small" />
                )
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" className="vaccination-service-detail-subtitle">
              Danh sách Vaccine
            </Typography>
            {vaccinationService.vaccinations && vaccinationService.vaccinations.length > 0 ? (
              <List>
                {vaccinationService.vaccinations.map((vaccine) => (
                  <ListItem key={vaccine.vaccinationId}>
                    <ListItemText
                      primary={vaccine.vaccinationName}
                      secondary={`Giá: ${vaccine.price.toLocaleString()} vnđ, Số mũi tiêm: ${vaccine.totalDoses}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Không có vaccine nào trong gói này.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
      <Footer />
    </Box>
  );
}

export default VaccinationServiceDetail;