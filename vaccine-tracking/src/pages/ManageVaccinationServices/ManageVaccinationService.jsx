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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Checkbox,
} from "@mui/material";
import { Edit, Delete, Add, CloudUpload } from "@mui/icons-material";
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

// Định nghĩa cấu trúc dữ liệu (thay vì interface)
/**
 * @typedef {object} VaccinationServiceResponse
 * @property {number} serviceID
 * @property {string} serviceName
 * @property {number} categoryId
 * @property {string} categoryName
 * @property {number} totalDoses
 * @property {number} price
 * @property {string} description
 * @property {VaccinationInfo[]} vaccinations
 */

/**
 * @typedef {object} VaccinationInfo
 * @property {number} vaccinationId
 * @property {string} vaccinationName
 * @property {string[]} diseases
 */

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
            service.serviceID === selectedService.serviceID
              ? { ...service, ...serviceData }
              : service
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
      let hasError = false; // Biến để theo dõi xem có lỗi xảy ra hay không
      for (const vaccinationId of selectedVaccinations) {
        try {
          await createVaccinationServiceVaccination({
            serviceID: serviceIdForVaccinations,
            vaccinationID: vaccinationId,
          });
        } catch (createError) {
          if (createError.response && createError.response.status === 400) {
            setError(createError.response.data); // Hiển thị lỗi từ backend
            hasError = true; // Đánh dấu là đã có lỗi
            break; // Thoát khỏi vòng lặp nếu có lỗi
          } else {
            setError("Lỗi khi liên kết vaccine. Vui lòng thử lại.");
            hasError = true;
             break; // Thoát khỏi vòng lặp nếu có lỗi
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
      // Gọi API xóa liên kết
      console.log("Xóa liên kết:", { serviceID: serviceId, vaccinationID: vaccinationId });
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
      <Typography variant="h4" align="center" gutterBottom className="manage-vaccine-title">
        Quản lý Dịch vụ Vaccine
      </Typography>

      {/*  Modified Box */}
      <Box display="flex" justifyContent="flex-start" mb={2} className="manage-vaccine-button-box">
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenForm}
          className="manage-vaccine-add-button"
        >
          Thêm mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} className="manage-vaccine-alert">
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} className="manage-vaccine-table-container">
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={200}
            className="manage-vaccine-loading-box"
          >
            <CircularProgress />
          </Box>
        ) : (
          <Table sx={{ minWidth: 800 }} aria-label="vaccination service table" className="manage-vaccine-table">
            <TableHead>
              <TableRow>
                <TableCell className="manage-vaccine-table-header">Tên Dịch Vụ</TableCell>
                <TableCell className="manage-vaccine-table-header">Loại</TableCell>
                <TableCell className="manage-vaccine-table-header">Số Mũi Tiêm</TableCell>
                <TableCell className="manage-vaccine-table-header">Giá</TableCell>
                <TableCell className="manage-vaccine-table-header">Mô tả</TableCell>
                <TableCell className="manage-vaccine-table-header">Vaccine</TableCell>
                <TableCell className="manage-vaccine-table-header">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vaccinationServices.map((service) => (
                <TableRow key={service.serviceID}>
                  <TableCell className="manage-vaccine-table-cell">{service.serviceName}</TableCell>
                  <TableCell className="manage-vaccine-table-cell">{service.categoryName}</TableCell>
                  <TableCell className="manage-vaccine-table-cell">{service.totalDoses}</TableCell>
                  <TableCell className="manage-vaccine-table-cell">{service.price}</TableCell>
                  <TableCell className="manage-vaccine-table-cell">{service.description}</TableCell>
                  <TableCell className="manage-vaccine-table-cell">
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
                  <TableCell className="manage-vaccine-table-cell">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(service)}
                      className="manage-vaccine-edit-button"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDelete(service.serviceID)}
                      className="manage-vaccine-delete-button"
                    >
                      <Delete />
                    </IconButton>
                    <Button
                      variant="outlined"
                      color="primary"
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

      {/* Dialog to Select Vaccinations */}
      <Dialog open={vaccinationSelectionOpen} onClose={handleCloseVaccinationSelection} fullWidth maxWidth="sm">
        <DialogTitle>Chọn Vaccine cho Dịch vụ</DialogTitle>
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
          <Button onClick={associateVaccinationsToService} color="primary">
            Liên kết
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default ManageVaccinationService;