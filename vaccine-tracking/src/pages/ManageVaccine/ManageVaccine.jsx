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
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import {
  getAllVaccination,
  deleteVaccination,
  createVaccinationt,
  updateVaccination,
  getVaccinationId,
} from "../../config/axios"; // Đảm bảo đường dẫn đúng
import VaccineForm from "./VaccineForm";
import Layout from "../../components/Layout/Layout"; // Import Layout

function ManageVaccine() {
  const [vaccines, setVaccines] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVaccines();
  }, []);

  const fetchVaccines = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllVaccination();
      console.log("Response from API (getAllVaccination):", response);
      if (response && response.data && Array.isArray(response.data)) {
        setVaccines(response.data);
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
        // Cập nhật
        await updateVaccination(selectedVaccine.vaccinationId, vaccineData);
        setVaccines((prevVaccines) =>
          prevVaccines.map((vaccine) =>
            vaccine.vaccinationId === selectedVaccine.vaccinationId
              ? { ...vaccine, ...vaccineData }
              : vaccine
          )
        );
      } else {
        // Tạo mới
        await createVaccinationt(vaccineData);
        fetchVaccines(); // Refresh danh sách
      }
      handleCloseForm();
      setError(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Có lỗi xảy ra khi thêm/sửa vaccine.");
    }
  };

  return (
    <Layout>
      <Typography variant="h4" align="center" gutterBottom>
        Quản lý Vaccine
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenForm}
        >
          Thêm mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={200}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Table sx={{ minWidth: 800 }} aria-label="vaccine table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên Vaccine</TableCell>
                <TableCell>Nhà Sản Xuất</TableCell>
                <TableCell>Số Mũi Tiêm</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vaccines.map((vaccine) => (
                <TableRow key={vaccine.vaccinationId}>
                  <TableCell>{vaccine.vaccinationId}</TableCell>
                  <TableCell>{vaccine.vaccinationName}</TableCell>
                  <TableCell>{vaccine.manufacturer}</TableCell>
                  <TableCell>{vaccine.totalDoses}</TableCell>
                  <TableCell>{vaccine.price}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit({ ...vaccine })}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDelete(vaccine.vaccinationId)}
                    >
                      <Delete />
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
    </Layout>
  );
}

export default ManageVaccine;