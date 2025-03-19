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
} from "@mui/material";
import { Edit, Delete, Add, CloudUpload } from "@mui/icons-material";
import {
  getAllVaccination,
  deleteVaccination,
  createVaccinationt,
  updateVaccination,
  getVaccinationImage,
  getAllDiseases,
  createVaccinationDisease,
  getDiseaseByVaccinationId,
} from "../../config/axios";
import VaccineForm from "./VaccineForm";
import Layout from "../../components/Layout/Layout";
import "./ManageVaccine.css";
import UploadImageForm from "./UploadImageForm";

function ManageVaccine() {
  const [vaccines, setVaccines] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadFormOpen, setIsUploadFormOpen] = useState(false);
  const [selectedVaccineIdForUpload, setSelectedVaccineIdForUpload] = useState(null);
  const [vaccineImages, setVaccineImages] = useState({});
  const [diseaseFormOpen, setDiseaseFormOpen] = useState(false);
  const [selectedVaccinationId, setSelectedVaccinationId] = useState(null);
  const [availableDiseases, setAvailableDiseases] = useState([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState("");

  useEffect(() => {
    fetchVaccines();
    fetchAvailableDiseases();
  }, []);

  const fetchVaccines = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllVaccination();
      if (response && response.data && Array.isArray(response.data)) {
        const vaccinesWithDiseases = await Promise.all(
          response.data.map(async (vaccine) => {
            try {
              const diseasesResponse = await getDiseaseByVaccinationId(vaccine.vaccinationId);
              return { ...vaccine, diseases: diseasesResponse };
            } catch (diseaseError) {
              console.error(`Error fetching diseases for vaccine ${vaccine.vaccinationId}:`, diseaseError);
              return { ...vaccine, diseases: [] };
            }
          })
        );
        setVaccines(vaccinesWithDiseases);
        vaccinesWithDiseases.forEach((vaccine) => {
          fetchVaccineImage(vaccine.vaccinationId);
        });
      } else {
        setError("Dữ liệu trả về từ getAllVaccination không đúng định dạng.");
      }
    } catch (error) {
      console.error("Error fetching vaccinations:", error);
      setError("Có lỗi xảy ra khi lấy dữ liệu vaccine.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccineImage = async (vaccinationId) => {
    try {
      const response = await getVaccinationImage(vaccinationId);
      setVaccineImages((prevImages) => ({
        ...prevImages,
        [vaccinationId]: response.data,
      }));
    } catch (error) {
      console.error(`Error fetching image for vaccine ${vaccinationId}:`, error);
    }
  };

  const fetchAvailableDiseases = async () => {
    try {
      const response = await getAllDiseases();
      setAvailableDiseases(response);
    } catch (error) {
      console.error("Error fetching available diseases:", error);
      setError("Có lỗi xảy ra khi lấy danh sách bệnh.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteVaccination(id);
      setVaccines((prevVaccines) =>
        prevVaccines.filter((vaccine) => vaccine.vaccinationId !== id)
      );
    } catch (error) {
      console.error("Error deleting vaccination:", error);
      setError("Có lỗi xảy ra khi xóa vaccine.");
    }
  };

  const handleOpenForm = () => {
    setSelectedVaccine(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleEdit = (vaccine) => {
    setSelectedVaccine({ ...vaccine });
    setIsFormOpen(true);
  };

  const handleSubmit = async (vaccineData) => {
    try {
      if (selectedVaccine) {
        await updateVaccination(selectedVaccine.vaccinationId, vaccineData);
        setVaccines((prevVaccines) =>
          prevVaccines.map((vaccine) =>
            vaccine.vaccinationId === selectedVaccine.vaccinationId
              ? { ...vaccine, ...vaccineData }
              : vaccine
          )
        );
      } else {
        await createVaccinationt(vaccineData);
        fetchVaccines();
      }
      handleCloseForm();
      setError(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Có lỗi xảy ra khi thêm/sửa vaccine.");
    }
  };

  const handleOpenUploadForm = (vaccinationId) => {
    setSelectedVaccineIdForUpload(vaccinationId);
    setIsUploadFormOpen(true);
  };

  const handleCloseUploadForm = () => {
    setIsUploadFormOpen(false);
    setSelectedVaccineIdForUpload(null);
  };

  const handleOpenDiseaseForm = (vaccinationId) => {
    setSelectedVaccinationId(vaccinationId);
    setDiseaseFormOpen(true);
  };

  const handleCloseDiseaseForm = () => {
    setDiseaseFormOpen(false);
    setSelectedVaccinationId(null);
    setSelectedDiseaseId("");
  };

  const handleDiseaseSelection = (event) => {
    setSelectedDiseaseId(event.target.value);
  };

  const handleAssociateDiseases = async () => {
    if (!selectedVaccinationId) {
      setError("Thiếu ID vaccine.");
      return;
    }
    if (!selectedDiseaseId) {
      setError("Vui lòng chọn một bệnh.");
      return;
    }
    try {
      await createVaccinationDisease(selectedVaccinationId, selectedDiseaseId);
      handleCloseDiseaseForm();
      setError(null);
      await fetchVaccines();
    } catch (error) {
      console.error("Error connecting diseases with vaccinations:", error);
      if (error.response && error.response.status === 409) {
        setError(`Lỗi: ${error.response.data}`);
      } else {
        setError(`Lỗi khi liên kết bệnh: ${error.message}`);
      }
    }
  };

  const getAgeUnitText = (ageUnitId) => {
    switch (ageUnitId) {
      case 1:
        return "ngày tuổi";
      case 2:
        return "tháng tuổi";
      case 3:
        return "năm tuổi";
      default:
        return "tuổi";
    }
  };

  const getIntervalUnitText = (unitId) => {
    switch (unitId) {
      case 1:
        return "ngày";
      case 2:
        return "tháng";
      case 3:
        return "năm";
      default:
        return "không xác định";
    }
  };

  return (
    <Layout>
      <Box className="manage-vaccine-container">
        <Typography variant="h4" className="manage-vaccine-title">
          Quản lý Vaccine
        </Typography>

        <Box className="manage-vaccine-button-box">
          <Button
            variant="contained"
            onClick={handleOpenForm}
            className="manage-vaccine-add-button"
          >
            Thêm Mới
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} className="manage-vaccine-alert">
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} className="manage-vaccine-table-container">
          {loading ? (
            <Box className="manage-vaccine-loading-box">
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : (
            <Table sx={{ minWidth: 800 }} aria-label="vaccine table">
              <TableHead>
                <TableRow>
                  <TableCell className="manage-vaccine-table-header">Tên Vaccine</TableCell>
                  <TableCell className="manage-vaccine-table-header">Nhà Sản Xuất</TableCell>
                  <TableCell className="manage-vaccine-table-header">Số Mũi Tiêm</TableCell>
                  <TableCell className="manage-vaccine-table-header">Giá</TableCell>
                  <TableCell className="manage-vaccine-table-header">Độ Tuổi Phù Hợp</TableCell>
                  <TableCell className="manage-vaccine-table-header">Khoảng Cách Tiêm</TableCell>
                  <TableCell className="manage-vaccine-table-header">Hình Ảnh</TableCell>
                  <TableCell className="manage-vaccine-table-header">Phòng Bệnh</TableCell>
                  <TableCell className="manage-vaccine-table-header">Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vaccines.map((vaccine) => (
                  <TableRow key={vaccine.vaccinationId} className="manage-vaccine-table-row">
                    <TableCell className="manage-vaccine-table-cell">
                      {vaccine.vaccinationName || "N/A"}
                    </TableCell>
                    <TableCell className="manage-vaccine-table-cell">
                      {vaccine.manufacturer || "N/A"}
                    </TableCell>
                    <TableCell className="manage-vaccine-table-cell">
                      {vaccine.totalDoses || "N/A"}
                    </TableCell>
                    <TableCell className="manage-vaccine-table-cell">
                      {vaccine.price ? `${vaccine.price} vnđ` : "N/A"}
                    </TableCell>
                    <TableCell className="manage-vaccine-table-cell">
                      {vaccine.minAge && vaccine.maxAge
                        ? `${vaccine.minAge} - ${vaccine.maxAge} ${getAgeUnitText(vaccine.ageUnitId)}`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="manage-vaccine-table-cell">
                      {vaccine.interval
                        ? `${vaccine.interval} ${getIntervalUnitText(vaccine.unitId)}`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="manage-vaccine-table-cell">
                      {vaccineImages[vaccine.vaccinationId] ? (
                        <img
                          src={vaccineImages[vaccine.vaccinationId]}
                          alt={vaccine.vaccinationName}
                          style={{ maxWidth: "50px", maxHeight: "50px" }}
                        />
                      ) : (
                        "Không có ảnh"
                      )}
                    </TableCell>
                    <TableCell className="manage-vaccine-table-cell">
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {vaccine.diseases && Array.isArray(vaccine.diseases) && vaccine.diseases.length > 0 ? (
                          vaccine.diseases.map((disease) => (
                            <Chip
                              key={disease.diseaseId}
                              label={disease.diseaseName}
                              size="small"
                            />
                          ))
                        ) : (
                          "Không có bệnh liên quan"
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenDiseaseForm(vaccine.vaccinationId)}
                        >
                          Thêm Bệnh
                        </Button>
                      </Box>
                    </TableCell>
                    <TableCell className="manage-vaccine-table-cell">
                      <IconButton
                        onClick={() => handleEdit({ ...vaccine })}
                        className="manage-vaccine-edit-button"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(vaccine.vaccinationId)}
                        className="manage-vaccine-delete-button"
                      >
                        <Delete />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenUploadForm(vaccine.vaccinationId)}
                        className="manage-vaccine-upload-button"
                      >
                        <CloudUpload />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        <VaccineForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          initialValues={selectedVaccine}
        />

        <UploadImageForm
          open={isUploadFormOpen}
          onClose={handleCloseUploadForm}
          vaccinationId={selectedVaccineIdForUpload}
          setError={setError}
          fetchVaccines={fetchVaccines}
        />

        <Dialog
          open={diseaseFormOpen}
          onClose={handleCloseDiseaseForm}
          fullWidth
          maxWidth="sm"
          className="manage-vaccine-dialog"
        >
          <DialogTitle className="manage-vaccine-dialog-title">Chọn Bệnh cho Vaccine</DialogTitle>
          <DialogContent>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="disease-select-label">Bệnh</InputLabel>
              <Select
                labelId="disease-select-label"
                id="disease-select"
                value={selectedDiseaseId}
                onChange={handleDiseaseSelection}
                label="Bệnh"
              >
                <MenuItem value="">
                  <em>Chọn bệnh</em>
                </MenuItem>
                {availableDiseases.map((disease) => (
                  <MenuItem key={disease.diseaseId} value={disease.diseaseId}>
                    {disease.diseaseName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDiseaseForm}>Hủy</Button>
            <Button
              variant="contained"
              onClick={handleAssociateDiseases}
              className="manage-vaccine-add-button"
            >
              Liên Kết
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}

export default ManageVaccine;