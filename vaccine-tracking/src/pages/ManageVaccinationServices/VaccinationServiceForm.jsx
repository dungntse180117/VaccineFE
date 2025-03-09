import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import "./VaccinationServiceForm.css";

function VaccinationServiceForm({ open, onClose, onSubmit, initialValues }) {
  const [serviceName, setServiceName] = useState(initialValues?.serviceName || "");
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [error, setError] = useState(null);

  // Danh sách category mặc định
  const categories = [
    { categoryId: 1, name: "Tiêm lẻ" },
    { categoryId: 2, name: "Gói tiêm chủng cho trẻ sơ sinh" },
    { categoryId: 3, name: "Gói tiêm chủng mở rộng" },
    { categoryId: 4, name: "Gói tiêm chủng dịch vụ" },
    { categoryId: 5, name: "Gói tiêm chủng cho người lớn" },
    { categoryId: 6, name: "Gói tiêm chủng cho phụ nữ mang thai" },
    { categoryId: 7, name: "Gói tiêm chủng du lịch" },
  ];

  const handleSubmit = () => {
    if (!serviceName || !categoryId) {
      setError("Vui lòng nhập tên dịch vụ và chọn danh mục.");
      return;
    }

    onSubmit({
      serviceName,
      categoryId: parseInt(categoryId),
      description,
    });

    onClose();
  };

  const handleClose = () => {
    onClose();
    setError(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialValues ? "Chỉnh sửa Dịch vụ Vaccine" : "Thêm Dịch vụ Vaccine"}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          label="Tên Dịch Vụ"
          type="text"
          fullWidth
          variant="outlined"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          className="vaccination-service-form-text-field"
        />
        <FormControl fullWidth margin="dense" className="vaccination-service-form-form-control">
          <InputLabel id="category-label">Danh Mục</InputLabel>
          <Select
            labelId="category-label"
            id="category"
            value={categoryId}
            label="Danh Mục"
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((category) => (
              <MenuItem key={category.categoryId} value={category.categoryId}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label="Mô Tả"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="vaccination-service-form-text-field"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button onClick={handleSubmit} color="primary">
          {initialValues ? "Cập Nhật" : "Thêm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default VaccinationServiceForm;