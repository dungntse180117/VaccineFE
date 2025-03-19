import React from "react";
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
import "./ManageVaccine.css";

function VaccineForm({ open, onClose, onSubmit, initialValues }) {
  const validationSchema = Yup.object({
    vaccinationName: Yup.string().required("Tên vaccine là bắt buộc"),
    manufacturer: Yup.string(),
    totalDoses: Yup.number()
      .integer()
      .positive()
      .min(1, "Số mũi tiêm phải từ 1 đến 10")
      .max(10, "Số mũi tiêm phải từ 1 đến 10"),
    price: Yup.number().positive().min(0, "Giá phải lớn hơn hoặc bằng 0"),
    interval: Yup.number().integer().positive(),
    description: Yup.string().max(1000, "Mô tả không được vượt quá 1000 ký tự"),
    minAge: Yup.number().integer().positive(),
    maxAge: Yup.number().integer().positive(),
    ageUnitId: Yup.number().integer(),
    unitId: Yup.number().integer(),
  });

  const formik = useFormik({
    initialValues: {
      vaccinationName: initialValues?.vaccinationName || "",
      manufacturer: initialValues?.manufacturer || "",
      totalDoses: initialValues?.totalDoses || 1,
      price: initialValues?.price || 0,
      interval: initialValues?.interval || 0,
      description: initialValues?.description || "",
      minAge: initialValues?.minAge || 0,
      maxAge: initialValues?.maxAge || 0,
      ageUnitId: initialValues?.ageUnitId || 0,
      unitId: initialValues?.unitId || 0,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      onClose();
    },
    enableReinitialize: true,
  });

  const ageUnits = [
    { id: 0, name: "Không xác định" },
    { id: 1, name: "Ngày" },
    { id: 2, name: "Tháng" },
    { id: 3, name: "Năm" },
  ];

  const intervalUnits = [
    { id: 0, name: "Không xác định" },
    { id: 1, name: "Ngày" },
    { id: 2, name: "Tháng" },
    { id: 3, name: "Năm" },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" className="vaccine-form-dialog">
      <DialogTitle className="vaccine-form-title">
        {initialValues ? "Chỉnh sửa Vaccine" : "Thêm Vaccine"}
      </DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <TextField
            fullWidth
            margin="normal"
            label="Tên Vaccine"
            name="vaccinationName"
            variant="outlined"
            value={formik.values.vaccinationName}
            onChange={formik.handleChange}
            error={formik.touched.vaccinationName && Boolean(formik.errors.vaccinationName)}
            helperText={formik.touched.vaccinationName && formik.errors.vaccinationName}
            className="vaccine-form-text-field"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Nhà Sản Xuất"
            name="manufacturer"
            variant="outlined"
            value={formik.values.manufacturer}
            onChange={formik.handleChange}
            error={formik.touched.manufacturer && Boolean(formik.errors.manufacturer)}
            helperText={formik.touched.manufacturer && formik.errors.manufacturer}
            className="vaccine-form-text-field"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Số Mũi Tiêm"
            name="totalDoses"
            type="number"
            variant="outlined"
            value={formik.values.totalDoses}
            onChange={formik.handleChange}
            error={formik.touched.totalDoses && Boolean(formik.errors.totalDoses)}
            helperText={formik.touched.totalDoses && formik.errors.totalDoses}
            className="vaccine-form-text-field"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Giá (vnđ)"
            name="price"
            type="number"
            variant="outlined"
            value={formik.values.price}
            onChange={formik.handleChange}
            error={formik.touched.price && Boolean(formik.errors.price)}
            helperText={formik.touched.price && formik.errors.price}
            className="vaccine-form-text-field"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Khoảng Cách Giữa Các Mũi"
            name="interval"
            type="number"
            variant="outlined"
            value={formik.values.interval}
            onChange={formik.handleChange}
            error={formik.touched.interval && Boolean(formik.errors.interval)}
            helperText={formik.touched.interval && formik.errors.interval}
            className="vaccine-form-text-field"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Mô Tả"
            name="description"
            multiline
            rows={3}
            variant="outlined"
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            className="vaccine-form-text-field"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Tuổi Tối Thiểu"
            name="minAge"
            type="number"
            variant="outlined"
            value={formik.values.minAge}
            onChange={formik.handleChange}
            error={formik.touched.minAge && Boolean(formik.errors.minAge)}
            helperText={formik.touched.minAge && formik.errors.minAge}
            className="vaccine-form-text-field"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Tuổi Tối Đa"
            name="maxAge"
            type="number"
            variant="outlined"
            value={formik.values.maxAge}
            onChange={formik.handleChange}
            error={formik.touched.maxAge && Boolean(formik.errors.maxAge)}
            helperText={formik.touched.maxAge && formik.errors.maxAge}
            className="vaccine-form-text-field"
          />
          <FormControl fullWidth margin="normal" variant="outlined" className="vaccine-form-select">
            <InputLabel id="ageUnitId-label">Đơn Vị Tuổi</InputLabel>
            <Select
              labelId="ageUnitId-label"
              name="ageUnitId"
              value={formik.values.ageUnitId}
              onChange={formik.handleChange}
              label="Đơn Vị Tuổi"
              error={formik.touched.ageUnitId && Boolean(formik.errors.ageUnitId)}
            >
              {ageUnits.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.ageUnitId && formik.errors.ageUnitId && (
              <div className="vaccine-form-error">{formik.errors.ageUnitId}</div>
            )}
          </FormControl>
          <FormControl fullWidth margin="normal" variant="outlined" className="vaccine-form-select">
            <InputLabel id="unitId-label">Đơn Vị Khoảng Cách</InputLabel>
            <Select
              labelId="unitId-label"
              name="unitId"
              value={formik.values.unitId}
              onChange={formik.handleChange}
              label="Đơn Vị Khoảng Cách"
              error={formik.touched.unitId && Boolean(formik.errors.unitId)}
            >
              {intervalUnits.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.unitId && formik.errors.unitId && (
              <div className="vaccine-form-error">{formik.errors.unitId}</div>
            )}
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="vaccine-form-button">
          Hủy
        </Button>
        <Button
          onClick={formik.handleSubmit}
          className="vaccine-form-button vaccine-form-primary-button"
        >
          {initialValues ? "Cập Nhật" : "Thêm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default VaccineForm;