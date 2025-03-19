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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import {
  getAllDiseases,
  deleteDisease,
  createDisease,
  updateDisease,
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
    if (!formData.diseaseName) {
      setError("Tên bệnh là bắt buộc.");
      return;
    }

    try {
      if (selectedDisease) {
        await updateDisease(selectedDisease.diseaseId, formData);
        setDiseases((prevDiseases) =>
          prevDiseases.map((disease) =>
            disease.diseaseId === selectedDisease.diseaseId
              ? { ...disease, ...formData }
              : disease
          )
        );
      } else {
        await createDisease(formData);
        fetchDiseases();
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
      <Box className="disease-manager-container">
        <Typography variant="h4" className="disease-manager-title">
          Quản lý Bệnh
        </Typography>

        <Box className="disease-manager-button-box">
          <Button
            variant="contained"
            onClick={handleOpenForm}
            className="disease-manager-add-button"
          >
            Thêm Mới
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} className="disease-manager-alert">
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} className="disease-manager-table-container">
          {loading ? (
            <Box className="disease-manager-loading-box">
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : (
            <Table sx={{ minWidth: 800 }} aria-label="disease table">
              <TableHead>
                <TableRow>
                  <TableCell className="disease-manager-table-header">Tên Bệnh</TableCell>
                  <TableCell className="disease-manager-table-header">Mô Tả</TableCell>
                  <TableCell className="disease-manager-table-header">Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diseases.map((disease) => (
                  <TableRow key={disease.diseaseId} className="disease-manager-table-row">
                    <TableCell className="disease-manager-table-cell">
                      {disease.diseaseName || "N/A"}
                    </TableCell>
                    <TableCell className="disease-manager-table-cell">
                      {disease.description || "N/A"}
                    </TableCell>
                    <TableCell className="disease-manager-table-cell">
                      <IconButton
                        onClick={() => handleEdit(disease)}
                        className="disease-manager-edit-button"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
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

        <Dialog
          open={isFormOpen}
          onClose={handleCloseForm}
          fullWidth
          maxWidth="sm"
          className="disease-manager-dialog"
        >
          <DialogTitle className="disease-manager-dialog-title">
            {selectedDisease ? "Chỉnh sửa Bệnh" : "Thêm Bệnh"}
          </DialogTitle>
          <DialogContent>
            <Box mt={2}>
              <TextField
                fullWidth
                margin="normal"
                label="Tên Bệnh"
                name="diseaseName"
                variant="outlined"
                value={formData.diseaseName}
                onChange={handleInputChange}
                className="disease-manager-text-field"
              />
              <TextField
                fullWidth
                margin="normal"
                label="Mô Tả"
                name="description"
                multiline
                rows={3}
                variant="outlined"
                value={formData.description}
                onChange={handleInputChange}
                className="disease-manager-text-field"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm} className="disease-manager-add-button">
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              className="disease-manager-add-button"
            >
              {selectedDisease ? "Cập Nhật" : "Thêm"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}

export default DiseaseManager;