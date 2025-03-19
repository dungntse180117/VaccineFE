import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import LayoutStaff from "../../components/Layout/LayoutStaff";
import "./RegistrationDetail.css";
import { getAllRegistrationDetails, createAppointment } from "../../config/axios";

function RegistrationDetail() {
  const [registrationDetails, setRegistrationDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedRegistrationDetailId, setSelectedRegistrationDetailId] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    registrationDetailID: null,
    appointmentDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [filteredRegistrationDetails, setFilteredRegistrationDetails] = useState([]);

  useEffect(() => {
    fetchRegistrationDetails();
  }, []);

  useEffect(() => {
    applyStatusFilter();
  }, [registrationDetails, selectedStatusFilter]);

  const fetchRegistrationDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllRegistrationDetails();
      if (data && Array.isArray(data)) {
        setRegistrationDetails(data);
      } else {
        setError("Dữ liệu từ API không hợp lệ.");
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết đăng ký:", err);
      setError("Không thể tải danh sách chi tiết đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  const applyStatusFilter = () => {
    let filtered = [...registrationDetails];
    if (selectedStatusFilter === "pending") {
      filtered = filtered.filter((detail) => detail.status !== "Đã tạo lịch tổng quát");
    } else if (selectedStatusFilter === "scheduled") {
      filtered = filtered.filter((detail) => detail.status === "Đã tạo lịch tổng quát");
    }
    setFilteredRegistrationDetails(filtered);
  };

  const handleOpen = (registrationDetailId) => {
    setSelectedRegistrationDetailId(registrationDetailId);
    setAppointmentData({
      registrationDetailID: registrationDetailId,
      appointmentDate: new Date().toISOString().slice(0, 10),
      notes: "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData({ ...appointmentData, [name]: value });
  };

  const handleCreateAppointment = async () => {
    try {
      await createAppointment(appointmentData);
      handleClose();
      fetchRegistrationDetails();
    } catch (err) {
      console.error("Lỗi khi tạo lịch hẹn:", err);
      setError("Không thể tạo lịch hẹn.");
    }
  };

  const handleStatusFilterChange = (event) => {
    setSelectedStatusFilter(event.target.value);
  };

  return (
    <LayoutStaff>
      <Box sx={{ padding: "40px 20px", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
        <Typography variant="h4" align="center" className="registration-detail-title">
          Danh Sách Chi Tiết Đăng Ký
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Thanh lọc trạng thái */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Lọc Theo Trạng Thái</InputLabel>
            <Select
              labelId="status-filter-label"
              value={selectedStatusFilter}
              label="Lọc Theo Trạng Thái"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="pending">Chưa lên lịch</MenuItem>
              <MenuItem value="scheduled">Đã lên lịch</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper} className="registration-detail-table-container">
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
              <CircularProgress size={50} />
            </Box>
          ) : (
            <Table sx={{ minWidth: 800 }} aria-label="registration detail table">
              <TableHead>
                <TableRow>
                  <TableCell className="registration-detail-table-header">Số muỗi tiêm</TableCell>
                  <TableCell className="registration-detail-table-header">Giá</TableCell>
                  <TableCell className="registration-detail-table-header">Ngày Mong Muốn</TableCell>
                  <TableCell className="registration-detail-table-header">Trạng Thái</TableCell>
                  <TableCell className="registration-detail-table-header">Tên Dịch Vụ</TableCell>
                  <TableCell className="registration-detail-table-header">Tên Vắc-Xin</TableCell>
                  <TableCell className="registration-detail-table-header">Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRegistrationDetails.map((detail) => (
                  <TableRow key={detail.registrationDetailID}>
                    <TableCell className="registration-detail-table-cell">{detail.quantity}</TableCell>
                    <TableCell className="registration-detail-table-cell">
                      {detail.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                    </TableCell>
                    <TableCell className="registration-detail-table-cell">
                      {detail.desiredDate
                        ? new Date(detail.desiredDate).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="registration-detail-table-cell">
                      <Chip
                        label={detail.status}
                        sx={{
                          bgcolor: detail.status === "Đã tạo lịch tổng quát" ? "#27ae60" : "#e67e22",
                          color: "#fff",
                          fontSize: "0.85rem",
                        }}
                      />
                    </TableCell>
                    <TableCell className="registration-detail-table-cell">{detail.serviceName}</TableCell>
                    <TableCell className="registration-detail-table-cell">
                      {detail.vaccinationNames ? detail.vaccinationNames.join(", ") : "N/A"}
                    </TableCell>
                    <TableCell className="registration-detail-table-cell">
                      {detail.status !== "Đã tạo lịch tổng quát" && (
                        <Button
                          variant="contained"
                          className="registration-detail-add-button"
                          onClick={() => handleOpen(detail.registrationDetailID)}
                        >
                          Tạo Lịch Hẹn
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Modal Tạo Lịch Hẹn */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: "#3498db", color: "#fff", fontWeight: 600 }}>
            Tạo Lịch Hẹn
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Ngày Hẹn"
              name="appointmentDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={appointmentData.appointmentDate}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Ghi Chú"
              name="notes"
              multiline
              rows={3}
              value={appointmentData.notes}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} variant="outlined" color="primary">
              Hủy
            </Button>
            <Button onClick={handleCreateAppointment} variant="contained" color="primary">
              Tạo
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LayoutStaff>
  );
}

export default RegistrationDetail;