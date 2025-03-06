import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

function VaccineForm({ open, onClose, onSubmit, initialValues }) {
  const validationSchema = Yup.object({
    vaccinationName: Yup.string().required("Tên vaccine là bắt buộc"),
    manufacturer: Yup.string(),
    totalDoses: Yup.number().integer().positive().min(1, "Số mũi tiêm phải từ 1 đến 10").max(10, "Số mũi tiêm phải từ 1 đến 10"),
    price: Yup.number().positive().min(0, "Giá phải lớn hơn hoặc bằng 0"),
    interval: Yup.number().integer().positive(),
    description: Yup.string().max(1000, "Mô tả không được vượt quá 1000 ký tự"),
    minAge: Yup.number().integer().positive(),
    maxAge: Yup.number().integer().positive(),
    ageUnitId: Yup.number().integer(), // Loại bỏ positive() vì có thể là 0
    unitId: Yup.number().integer(), // Loại bỏ positive() vì có thể là 0
    // Thêm các validation khác
  });

  const formik = useFormik({
    initialValues: {
      vaccinationName: initialValues?.vaccinationName || "",
      manufacturer: initialValues?.manufacturer || "",
      totalDoses: initialValues?.totalDoses || 1, // Giá trị mặc định là 1
      price: initialValues?.price || 0, // Giá trị mặc định là 0
      interval: initialValues?.interval || 0, // Giá trị mặc định là 0
      description: initialValues?.description || "",
      minAge: initialValues?.minAge || 0, // Giá trị mặc định là 0
      maxAge: initialValues?.maxAge || 0, // Giá trị mặc định là 0
      ageUnitId: initialValues?.ageUnitId || 0, // Giá trị mặc định là 0
      unitId: initialValues?.unitId || 0, // Giá trị mặc định là 0
      // Thêm các trường khác
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      onClose(); // Đóng form
    },
    enableReinitialize: true, // Quan trọng để cập nhật initialValues khi chỉnh sửa
  });

  // Dữ liệu mẫu cho select (thay bằng API thật nếu có)
  const ageUnits = [
    { id: 0, name: "Không xác định" }, // Thêm giá trị 0
    { id: 1, name: "Năm" },
    { id: 2, name: "Tháng" },
    { id: 3, name: "Ngày" },
  ];

  const intervalUnits = [
    { id: 0, name: "Không xác định" }, // Thêm giá trị 0
    { id: 1, name: "Ngày" },
    { id: 2, name: "Tuần" },
    { id: 3, name: "Tháng" },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValues ? "Chỉnh sửa Vaccine" : "Thêm Vaccine"}</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <TextField
            fullWidth
            margin="normal"
            label="Tên Vaccine"
            name="vaccinationName"
            value={formik.values.vaccinationName}
            onChange={formik.handleChange}
            error={formik.touched.vaccinationName && Boolean(formik.errors.vaccinationName)}
            helperText={formik.touched.vaccinationName && formik.errors.vaccinationName}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Nhà Sản Xuất"
            name="manufacturer"
            value={formik.values.manufacturer}
            onChange={formik.handleChange}
            error={formik.touched.manufacturer && Boolean(formik.errors.manufacturer)}
            helperText={formik.touched.manufacturer && formik.errors.manufacturer}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Số Mũi Tiêm"
            name="totalDoses"
            type="number"
            value={formik.values.totalDoses}
            onChange={formik.handleChange}
            error={formik.touched.totalDoses && Boolean(formik.errors.totalDoses)}
            helperText={formik.touched.totalDoses && formik.errors.totalDoses}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Giá"
            name="price"
            type="number"
            value={formik.values.price}
            onChange={formik.handleChange}
            error={formik.touched.price && Boolean(formik.errors.price)}
            helperText={formik.touched.price && formik.errors.price}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Khoảng cách giữa các mũi"
            name="interval"
            type="number"
            value={formik.values.interval}
            onChange={formik.handleChange}
            error={formik.touched.interval && Boolean(formik.errors.interval)}
            helperText={formik.touched.interval && formik.errors.interval}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Mô tả"
            name="description"
            multiline
            rows={3}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Tuổi tối thiểu"
            name="minAge"
            type="number"
            value={formik.values.minAge}
            onChange={formik.handleChange}
            error={formik.touched.minAge && Boolean(formik.errors.minAge)}
            helperText={formik.touched.minAge && formik.errors.minAge}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Tuổi tối đa"
            name="maxAge"
            type="number"
            value={formik.values.maxAge}
            onChange={formik.handleChange}
            error={formik.touched.maxAge && Boolean(formik.errors.maxAge)}
            helperText={formik.touched.maxAge && formik.errors.maxAge}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="ageUnitId-label">Đơn vị tuổi</InputLabel>
            <Select
              labelId="ageUnitId-label"
              name="ageUnitId"
              value={formik.values.ageUnitId}
              onChange={formik.handleChange}
              error={formik.touched.ageUnitId && Boolean(formik.errors.ageUnitId)}
            >
              {ageUnits.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.ageUnitId && formik.errors.ageUnitId && (
              <div style={{ color: "red" }}>{formik.errors.ageUnitId}</div>
            )}
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="unitId-label">Đơn vị khoảng cách</InputLabel>
            <Select
              labelId="unitId-label"
              name="unitId"
              value={formik.values.unitId}
              onChange={formik.handleChange}
              error={formik.touched.unitId && Boolean(formik.errors.unitId)}
            >
              {intervalUnits.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.unitId && formik.errors.unitId && (
              <div style={{ color: "red" }}>{formik.errors.unitId}</div>
            )}
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button color="primary" onClick={formik.handleSubmit}>
          {initialValues ? "Cập nhật" : "Thêm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default VaccineForm;