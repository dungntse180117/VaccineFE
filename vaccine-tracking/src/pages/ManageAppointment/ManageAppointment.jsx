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
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import LayoutStaff from "../../components/Layout/LayoutStaff";
import "./ManageAppointment.css";
import {
  getAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../config/axios";
import { useNavigate } from "react-router-dom";

function ManageAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    appointmentDate: null,
    notes: "",
  });
  const [statusFilter, setStatusFilter] = useState(""); 

  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAppointment();
      if (data && Array.isArray(data)) {
        setAppointments(data);
        setFilteredAppointments(data); 
      } else {
        setError("Dữ liệu từ API không hợp lệ.");
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch hẹn:", err);
      setError("Không thể tải danh sách lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (event) => {
    const selectedStatus = event.target.value;
    setStatusFilter(selectedStatus);

    if (selectedStatus === "") {
      setFilteredAppointments(appointments); 
    } else {
      const filtered = appointments.filter(
        (appointment) => appointment.status === selectedStatus
      );
      setFilteredAppointments(filtered);
    }
  };

  const handleOpen = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      appointmentDate: appointment.appointmentDate
        ? new Date(appointment.appointmentDate).toISOString().slice(0, 10)
        : "",
      notes: appointment.notes || "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateAppointment = async () => {
    try {
      await updateAppointment(selectedAppointment.appointmentID, formData);
      fetchAppointments();
      handleClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật lịch hẹn:", err);
      setError("Không thể cập nhật lịch hẹn.");
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa lịch hẹn này không?")) {
      try {
        await deleteAppointment(id);
        fetchAppointments();
      } catch (err) {
        console.error("Lỗi khi xóa lịch hẹn:", err);
        setError("Không thể xóa lịch hẹn.");
      }
    }
  };

  const handleViewDetails = (appointmentId) => {
    navigate(`/appointments/${appointmentId}`);
  };

  return (
    <LayoutStaff>
      <Box sx={{ padding: "40px 20px", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          className="appointment-manager-title"
        >
          Quản lý Lịch Hẹn
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Lọc theo trạng thái</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Lọc theo trạng thái"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="Đã hoàn thành lịch tiêm">Đã hoàn thành lịch tiêm</MenuItem>
              <MenuItem value="Lên lịch hoàn tất">Lên lịch hoàn tất</MenuItem>
              <MenuItem value="Chưa được lên lịch">Chưa được lên lịch</MenuItem>
              <MenuItem value="Đang lên lịch">Đang lên lịch</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} className="appointment-manager-table-container">
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
              <CircularProgress size={50} />
            </Box>
          ) : (
            <Table sx={{ minWidth: 800 }} aria-label="appointment table">
              <TableHead>
                <TableRow>     
                  <TableCell className="appointment-manager-table-header">Ngày Hẹn</TableCell>
                  <TableCell className="appointment-manager-table-header">Trạng Thái</TableCell>
                  <TableCell className="appointment-manager-table-header">Ghi Chú</TableCell>
                  <TableCell className="appointment-manager-table-header">Tên Bệnh Nhân</TableCell>
                  <TableCell className="appointment-manager-table-header">Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.appointmentID}>
                    <TableCell className="appointment-manager-table-cell">
                      {appointment.appointmentDate
                        ? new Date(appointment.appointmentDate).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="appointment-manager-table-cell">
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 1,
                          py: 0.5,
                          borderRadius: "12px",
                          bgcolor:
                            appointment.status === "Đã hoàn thành lịch tiêm"
                              ? "#27ae60"
                              : appointment.status === "Lên lịch hoàn tất"
                              ? "#3498db"
                              : "#e67e22",
                          color: "#fff",
                          fontSize: "0.85rem",
                        }}
                      >
                        {appointment.status}
                      </Box>
                    </TableCell>
                    <TableCell className="appointment-manager-table-cell">{appointment.notes || "Không có"}</TableCell>
                    <TableCell className="appointment-manager-table-cell">{appointment.patientName}</TableCell>
                    <TableCell className="appointment-manager-table-cell">
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          className="appointment-manager-edit-button"
                          onClick={() => handleViewDetails(appointment.appointmentID)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          className="appointment-manager-edit-button"
                          onClick={() => handleOpen(appointment)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          className="appointment-manager-delete-button"
                          onClick={() => handleDeleteAppointment(appointment.appointmentID)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: "#3498db", color: "#fff", fontWeight: 600 }}>
            Chỉnh sửa Lịch Hẹn
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Ngày Hẹn"
              name="appointmentDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.appointmentDate || ""}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Ghi Chú"
              name="notes"
              multiline
              rows={4}
              value={formData.notes || ""}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} variant="outlined" color="primary">
              Hủy
            </Button>
            <Button onClick={handleUpdateAppointment} variant="contained" color="primary">
              Cập Nhật
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LayoutStaff>
  );
}

export default ManageAppointment;