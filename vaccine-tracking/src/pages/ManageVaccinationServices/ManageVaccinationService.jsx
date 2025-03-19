import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Checkbox,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import {
  getAllVaccinationServices,
  deleteVaccinationService,
  createVaccinationService,
  updateVaccinationService,
  createVaccinationServiceVaccination,
  deleteVaccinationServiceVaccination,
  getAllVaccination,
} from "../../config/axios";
import VaccinationServiceForm from "./VaccinationServiceForm";
import Layout from "../../components/Layout/Layout";
import "./ManageVaccinationService.css";

function ManageVaccinationService() {
  const [vaccinationServices, setVaccinationServices] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [availableVaccinations, setAvailableVaccinations] = useState([]);
  const [selectedVaccinations, setSelectedVaccinations] = useState([]);
  const [serviceIdForVaccinations, setServiceIdForVaccinations] = useState(null);
  const [vaccinationSelectionOpen, setVaccinationSelectionOpen] = useState(false);

  useEffect(() => {
    fetchVaccinationServices();
    fetchAvailableVaccinations();
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

  const fetchAvailableVaccinations = async () => {
    try {
      const response = await getAllVaccination();
      setAvailableVaccinations(response.data);
    } catch (error) {
      console.error("Error fetching available vaccinations:", error);
      setError("Có lỗi xảy ra khi lấy danh sách vaccine.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteVaccinationService(id);
      setVaccinationServices((prevServices) =>
        prevServices.filter((service) => service.serviceID !== id)
      );
    } catch (error) {
      console.error("Error deleting vaccination service:", error);
      setError("Có lỗi xảy ra khi xóa dịch vụ vaccine.");
    }
  };

  const handleOpenForm = () => {
    setSelectedService(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleEdit = (service) => {
    setSelectedService({ ...service });
    setIsFormOpen(true);
  };

  const handleSubmit = async (serviceData) => {
    try {
      if (selectedService) {
        await updateVaccinationService(selectedService.serviceID, serviceData);
        setVaccinationServices((prevServices) =>
          prevServices.map((service) =>
            service.serviceID === selectedService.serviceID ? { ...service, ...serviceData } : service
          )
        );
      } else {
        await createVaccinationService(serviceData);
        fetchVaccinationServices();
      }
      handleCloseForm();
      setError(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Có lỗi xảy ra khi thêm/sửa dịch vụ vaccine.");
    }
  };

  const handleOpenVaccinationSelection = (serviceId) => {
    setServiceIdForVaccinations(serviceId);
    setSelectedVaccinations([]);
    setVaccinationSelectionOpen(true);
  };

  const handleCloseVaccinationSelection = () => {
    setVaccinationSelectionOpen(false);
  };

  const handleVaccinationToggle = (vaccinationId) => {
    setSelectedVaccinations((prev) =>
      prev.includes(vaccinationId)
        ? prev.filter((id) => id !== vaccinationId)
        : [...prev, vaccinationId]
    );
  };

  const associateVaccinationsToService = async () => {
    if (!serviceIdForVaccinations || selectedVaccinations.length === 0) {
      setError("Vui lòng chọn một dịch vụ và ít nhất một vaccine.");
      return;
    }

    try {
      let hasError = false;
      for (const vaccinationId of selectedVaccinations) {
        try {
          await createVaccinationServiceVaccination({
            serviceID: serviceIdForVaccinations,
            vaccinationID: vaccinationId,
          });
        } catch (createError) {
          if (createError.response && createError.response.status === 400) {
            setError(createError.response.data);
            hasError = true;
            break;
          } else {
            setError("Lỗi khi liên kết vaccine. Vui lòng thử lại.");
            hasError = true;
            break;
          }
        }
      }

      if (!hasError) {
        fetchVaccinationServices();
        setSelectedVaccinations([]);
        setServiceIdForVaccinations(null);
        setVaccinationSelectionOpen(false);
        setError(null);
      }
    } catch (error) {
      console.error("Error associating vaccinations:", error);
      setError("Lỗi khi liên kết vaccine. Vui lòng thử lại.");
    }
  };

  const handleRemoveVaccination = async (serviceId, vaccinationId) => {
    try {
      await deleteVaccinationServiceVaccination({ serviceID: serviceId, vaccinationID: vaccinationId });
      fetchVaccinationServices();
      setError(null);
    } catch (error) {
      console.error("Error removing vaccination from service:", error);
      setError("Có lỗi xảy ra khi xóa vaccine khỏi dịch vụ.");
    }
  };

  return (
    <Layout>
      <Box className="manage-vaccination-service-container">
        <Typography variant="h4" className="manage-vaccination-service-title">
          Quản lý Dịch vụ Vaccine
        </Typography>

        <Box className="manage-vaccination-service-button-box">
          <Button
            variant="contained"
            onClick={handleOpenForm}
            className="manage-vaccination-service-add-button"
          >
            Thêm Mới
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} className="manage-vaccination-service-alert">
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} className="manage-vaccination-service-table-container">
          {loading ? (
            <Box className="manage-vaccination-service-loading-box">
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : (
            <Table sx={{ minWidth: 800 }} aria-label="vaccination service table">
              <TableHead>
                <TableRow>
                  <TableCell className="manage-vaccination-service-table-header">Tên Dịch Vụ</TableCell>
                  <TableCell className="manage-vaccination-service-table-header">Loại</TableCell>
                  <TableCell className="manage-vaccination-service-table-header">Số Mũi Tiêm</TableCell>
                  <TableCell className="manage-vaccination-service-table-header">Giá</TableCell>
                  <TableCell className="manage-vaccination-service-table-header">Mô Tả</TableCell>
                  <TableCell className="manage-vaccination-service-table-header">Vaccine</TableCell>
                  <TableCell className="manage-vaccination-service-table-header">Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vaccinationServices.map((service) => (
                  <TableRow key={service.serviceID} className="manage-vaccination-service-table-row">
                    <TableCell className="manage-vaccination-service-table-cell">
                      {service.serviceName}
                    </TableCell>
                    <TableCell className="manage-vaccination-service-table-cell">
                      {service.categoryName || "N/A"}
                    </TableCell>
                    <TableCell className="manage-vaccination-service-table-cell">
                      {service.totalDoses || "N/A"}
                    </TableCell>
                    <TableCell className="manage-vaccination-service-table-cell">
                      {service.price ? `${service.price} vnđ` : "N/A"}
                    </TableCell>
                    <TableCell className="manage-vaccination-service-table-cell">
                      {service.description || "N/A"}
                    </TableCell>
                    <TableCell className="manage-vaccination-service-table-cell">
                      {service.vaccinations && service.vaccinations.length > 0 ? (
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {service.vaccinations.map((vaccine) => (
                            <Chip
                              key={vaccine.vaccinationId}
                              label={vaccine.vaccinationName}
                              onDelete={() => handleRemoveVaccination(service.serviceID, vaccine.vaccinationId)}
                              deleteIcon={<Delete />}
                              size="small"
                            />
                          ))}
                        </Box>
                      ) : (
                        "Chưa có vaccine"
                      )}
                    </TableCell>
                    <TableCell className="manage-vaccination-service-table-cell">
                      <IconButton
                        onClick={() => handleEdit(service)}
                        className="manage-vaccination-service-edit-button"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(service.serviceID)}
                        className="manage-vaccination-service-delete-button"
                      >
                        <Delete />
                      </IconButton>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenVaccinationSelection(service.serviceID)}
                      >
                        Chọn Vaccine
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        <VaccinationServiceForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          initialValues={selectedService}
        />

        {/* Dialog Chọn Vaccine */}
        <Dialog
          open={vaccinationSelectionOpen}
          onClose={handleCloseVaccinationSelection}
          fullWidth
          maxWidth="sm"
          className="manage-vaccination-service-dialog"
        >
          <DialogTitle className="manage-vaccination-service-dialog-title">
            Chọn Vaccine cho Dịch vụ
          </DialogTitle>
          <DialogContent>
            <List>
              {availableVaccinations.map((vaccine) => (
                <ListItem key={vaccine.vaccinationId}>
                  <ListItemText primary={vaccine.vaccinationName} />
                  <Checkbox
                    checked={selectedVaccinations.includes(vaccine.vaccinationId)}
                    onChange={() => handleVaccinationToggle(vaccine.vaccinationId)}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseVaccinationSelection}>Hủy</Button>
            <Button
              variant="contained"
              onClick={associateVaccinationsToService}
              className="manage-vaccination-service-add-button"
            >
              Liên Kết
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}

export default ManageVaccinationService;