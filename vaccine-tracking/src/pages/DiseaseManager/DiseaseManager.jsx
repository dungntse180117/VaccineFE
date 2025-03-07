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
  TextField,
  Dialog,  // Import Dialog
  DialogTitle,  // Import DialogTitle
  DialogContent, // Import DialogContent
  DialogActions, // Import DialogActions
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import {
  getAllDiseases,
  deleteDisease,
  createDisease,
  updateDisease,
  getDiseaseById,
} from "../../config/axios";
import Layout from "../../components/Layout/Layout";
import "./DiseaseManager.css";

function DiseaseManager() {
  const [diseases, setDiseases] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    diseaseName: "",
    description: "",
  });

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllDiseases();
      console.log("Response from API (getAllDiseases):", data);
      if (data && Array.isArray(data)) {
        setDiseases(data);
      } else {
        setError("Dữ liệu trả về từ getAllDiseases không đúng định dạng.");
      }
    } catch (error) {
      console.error("Error fetching diseases:", error);
      setError("Có lỗi xảy ra khi lấy dữ liệu bệnh.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDisease(id);
      setDiseases((prevDiseases) =>
        prevDiseases.filter((disease) => disease.diseaseId !== id)
      );
      fetchDiseases(); // Refresh danh sách
    } catch (error) {
      console.error("Error deleting disease:", error);
      setError("Có lỗi xảy ra khi xóa bệnh.");
    }
  };

  const handleOpenForm = () => {
    setSelectedDisease(null);
    setIsFormOpen(true);
    setFormData({
      diseaseName: "",
      description: "",
    });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleEdit = (disease) => {
    setSelectedDisease({ ...disease });
    setIsFormOpen(true);
    setFormData({
      diseaseName: disease.diseaseName,
      description: disease.description,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedDisease) {
        // Cập nhật
        await updateDisease(selectedDisease.diseaseId, formData);
        setDiseases((prevDiseases) =>
          prevDiseases.map((disease) =>
            disease.diseaseId === selectedDisease.diseaseId
              ? { ...disease, ...formData }
              : disease
          )
        );
      } else {
        // Tạo mới
        await createDisease(formData);
        fetchDiseases(); // Refresh danh sách
      }
      handleCloseForm();
      setError(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Có lỗi xảy ra khi thêm/sửa bệnh.");
    }
  };

  return (
    <Layout>
      <Typography variant="h4" align="center" gutterBottom className="disease-manager-title">
        Quản lý Bệnh
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={2} className="disease-manager-button-box">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenForm}
          className="disease-manager-add-button"
        >
          Thêm mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} className="disease-manager-alert">
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} className="disease-manager-table-container">
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={200}
            className="disease-manager-loading-box"
          >
            <CircularProgress />
          </Box>
        ) : (
          <Table sx={{ minWidth: 800 }} aria-label="disease table" className="disease-manager-table">
            <TableHead>
              <TableRow>
                <TableCell className="disease-manager-table-header">ID</TableCell>
                <TableCell className="disease-manager-table-header">Tên Bệnh</TableCell>
                <TableCell className="disease-manager-table-header">Mô Tả</TableCell>
                <TableCell className="disease-manager-table-header">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {diseases.map((disease) => (
                <TableRow key={disease.diseaseId}>
                  <TableCell className="disease-manager-table-cell">{disease.diseaseId}</TableCell>
                  <TableCell className="disease-manager-table-cell">{disease.diseaseName}</TableCell>
                  <TableCell className="disease-manager-table-cell">{disease.description}</TableCell>
                  <TableCell className="disease-manager-table-cell">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(disease)}
                      className="disease-manager-edit-button"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDelete(disease.diseaseId)}
                      className="disease-manager-delete-button"
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

      <Dialog open={isFormOpen} onClose={handleCloseForm} fullWidth maxWidth="sm">
        <DialogTitle>{selectedDisease ? "Chỉnh sửa Bệnh" : "Thêm Bệnh"}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              margin="normal"
              label="Tên Bệnh"
              name="diseaseName"
              value={formData.diseaseName}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Mô tả"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Hủy</Button>
          <Button color="primary" onClick={handleSubmit}>
            {selectedDisease ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default DiseaseManager;