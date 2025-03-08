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
  const [diseaseFormOpen, setDiseaseFormOpen] = useState(false);  // Add the import for setting new state
  const [selectedVaccinationId, setSelectedVaccinationId] = useState(null);  // Add the import for vaccination ID
  const [availableDiseases, setAvailableDiseases] = useState([]);
  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState([]);//update useState
  //Update code for default one Id
  const [selectedDiseaseId, setSelectedDiseaseId] = useState('');


  useEffect(() => {
    fetchVaccines();
    fetchAvailableDiseases();
  }, []);

  const fetchVaccines = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllVaccination();
      console.log("Response from API (getAllVaccination):", response);

      if (response && response.data && Array.isArray(response.data)) {
        // Fetch diseases for each vaccine
        const vaccinesWithDiseases = await Promise.all(
          response.data.map(async (vaccine) => {
            try {
              const diseasesResponse = await getDiseaseByVaccinationId(vaccine.vaccinationId);
              console.log(`Diseases for vaccine ${vaccine.vaccinationId}:`, diseasesResponse);
              return { ...vaccine, diseases: diseasesResponse };
            } catch (diseaseError) {
              console.error(`Error fetching diseases for vaccine ${vaccine.vaccinationId}:`, diseaseError);
              return { ...vaccine, diseases: [] }; // Return empty array in case of error
            }
          })
        );
        setVaccines(vaccinesWithDiseases); // Update state with vaccines including diseases
        vaccinesWithDiseases.forEach(vaccine => {
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
      setVaccineImages(prevImages => ({
        ...prevImages,
        [vaccinationId]: response.data,
      }));
    } catch (error) {
      console.error(`Error fetching image for vaccine ${vaccinationId}:`, error);
    }
  };
  // Add use Effect to Fetch list diseases.
  const fetchAvailableDiseases = async () => {
    try {
      const response = await getAllDiseases();
      setAvailableDiseases(response);
    } catch (error) {
      console.error("Error fetching available diseases:", error);
      setError("Error fetching available diseases")
    }
  }

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
    setSelectedDiseaseId('');// Update clean for one selected .
  };

  //update handle for select one.
  const handleDiseaseSelection = (event) => {
    setSelectedDiseaseId(event.target.value);
  };

  const handleAssociateDiseases = async () => {
    if (!selectedVaccinationId) {
      setError("Vaccination ID is missing.");
      return;
    }
    // Update if not existed value.
    if (!selectedDiseaseId) {
      setError("No diseases selected.");
      return;
    }
    try {
      console.log(`Associating vaccination ${selectedVaccinationId} with diseases ${selectedDiseaseId}`);
      await createVaccinationDisease(selectedVaccinationId, selectedDiseaseId);

      handleCloseDiseaseForm();
      setError(null);
      await fetchVaccines();

    } catch (error) {
      console.error("Error connecting diseases with vaccinations:", error);
      if (error.response && error.response.status === 409) {
        // *HIỂN THÔNG TIN LỖI CỤ THỂ*
        setError(`Lỗi: ${error.response.data}`); // Giả sử API trả về một chuỗi thông báo lỗi
      } else {
        setError(`Error while connecting all disease ${error.message}`);
      }
    }
  };

    // Hàm lấy đơn vị tuổi
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

    // Hàm lấy đơn vị khoảng cách tiêm
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
      <Typography variant="h4" align="center" gutterBottom className="manage-vaccine-title">
        Quản lý Vaccine
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
          <Table sx={{ minWidth: 800 }} aria-label="vaccine table" className="manage-vaccine-table">
            <TableHead>
              <TableRow>
                <TableCell className="manage-vaccine-table-header">Tên Vaccine</TableCell>
                <TableCell className="manage-vaccine-table-header">Nhà Sản Xuất</TableCell>
                <TableCell className="manage-vaccine-table-header">Số Mũi Tiêm</TableCell>
                <TableCell className="manage-vaccine-table-header">Giá</TableCell>
                                {/* THÊM CỘT ĐỘ TUỔI PHÙ HỢP */}
                                <TableCell className="manage-vaccine-table-header">Độ tuổi phù hợp</TableCell>

                                {/* THÊM CỘT KHOẢNG CÁCH TIÊM */}
                                <TableCell className="manage-vaccine-table-header">Khoảng cách tiêm</TableCell>
                <TableCell className="manage-vaccine-table-header">Hình ảnh</TableCell>
                <TableCell className="manage-vaccine-table-header">Phòng Bệnh</TableCell>
                <TableCell className="manage-vaccine-table-header">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vaccines.map((vaccine) => (
                <TableRow key={vaccine.vaccinationId}>
                  <TableCell className="manage-vaccine-table-cell">{vaccine.vaccinationName}</TableCell>
                  <TableCell className="manage-vaccine-table-cell">{vaccine.manufacturer}</TableCell>
                  <TableCell className="manage-vaccine-table-cell">{vaccine.totalDoses}</TableCell>
                  <TableCell className="manage-vaccine-table-cell">{vaccine.price}</TableCell>
                                       {/* HIỂN THỊ THÔNG TIN ĐỘ TUỔI PHÙ HỢP */}
                                        <TableCell className="manage-vaccine-table-cell">
                                          {vaccine.minAge} - {vaccine.maxAge} {getAgeUnitText(vaccine.ageUnitId)}
                                        </TableCell>

                                        {/* HIỂN THỊ THÔNG TIN KHOẢNG CÁCH TIÊM */}
                                        <TableCell className="manage-vaccine-table-cell">
                                          {vaccine.interval} {getIntervalUnitText(vaccine.unitId)}
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
                    {/* Add List All the tag, so if you add more tag it will display in screen, */}
                    <Box display="flex" gap={0.5}>
                      {/* Render existing diseases as chips */}
                      {vaccine.diseases && Array.isArray(vaccine.diseases) && vaccine.diseases.length > 0 ? (
                        vaccine.diseases.map((disease) => (
                          <Chip
                            key={disease.diseaseId}
                            label={disease.diseaseName}
                            size="small"
                          />
                        ))
                      ) : (
                        <span>Không có bệnh liên quan</span>
                      )}
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDiseaseForm(vaccine.vaccinationId)}
                      >
                        Thêm bệnh
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell className="manage-vaccine-table-cell">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit({ ...vaccine })}
                      className="manage-vaccine-edit-button"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDelete(vaccine.vaccinationId)}
                      className="manage-vaccine-delete-button"
                    >
                      <Delete />
                    </IconButton>
                    <IconButton
                      color="primary"
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
      {/* New Dialog for disease list*/}
      <Dialog open={diseaseFormOpen} onClose={handleCloseDiseaseForm} fullWidth maxWidth="sm">
        <DialogTitle>Chọn Bệnh cho Vaccine</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id="disease-multiple-checkbox-label">Bệnh</InputLabel>
            {/* Update code for not allow select mutiple */}
            <Select
              labelId="disease-select-label"
              id="disease-select"
              value={selectedDiseaseId}
              onChange={handleDiseaseSelection}
            >
              <MenuItem value="">
                <em>None</em>
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
          <Button onClick={handleAssociateDiseases} color="primary">
            Liên kết
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default ManageVaccine;