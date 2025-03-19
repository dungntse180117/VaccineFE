import React, { useState, useEffect, useCallback } from "react";
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Chip,
  Grid,
} from "@mui/material";
import LayoutStaff from "../../components/Layout/LayoutStaff";
import "./ManageAppointment.css";
import { useParams } from "react-router-dom";
import {
  getAppointmentDetail,
  getVisitsByAppointmentId,
  createVisit,
} from "../../config/axios";

function AppointmentDetails() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visits, setVisits] = useState([]);
  const [visitFormOpen, setVisitFormOpen] = useState(false);
  const [visitData, setVisitData] = useState({
    visitDate: new Date().toISOString().slice(0, 10),
    notes: "",
    appointmentVaccinationIds: [],
  });
  const [appointmentVaccinations, setAppointmentVaccinations] = useState([]);
  const [showAllVaccinations, setShowAllVaccinations] = useState(false);

  const fetchVisits = useCallback(async () => {
    try {
      const response = await getVisitsByAppointmentId(appointmentId);
      if (Array.isArray(response?.data)) {
        setVisits(response.data);
      } else {
        setVisits([]);
      }
    } catch (err) {
      console.error("Error fetching visits:", err);
      setError("Không thể tải danh sách lượt thăm.");
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchAppointmentDetails();
    fetchVisits();
  }, [appointmentId, fetchVisits]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAppointmentDetail(appointmentId);
      setAppointment(data);
      if (data && data.appointmentVaccinations) {
        setAppointmentVaccinations(
          data.appointmentVaccinations.filter((vaccination) => vaccination.dosesScheduled > 0)
        );
      }
    } catch (err) {
      console.error("Error fetching appointment details:", err);
      setError("Không thể tải chi tiết lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVisitForm = () => {
    setVisitFormOpen(true);
    setVisitData({
      visitDate: new Date().toISOString().slice(0, 10),
      notes: "",
      appointmentVaccinationIds: [],
    });
  };

  const handleCloseVisitForm = () => {
    setVisitFormOpen(false);
  };

  const handleVisitInputChange = (e) => {
    const { name, value } = e.target;
    setVisitData({ ...visitData, [name]: value });
  };

  const handleVaccinationSelection = (event, appointmentVaccinationID) => {
    if (event.target.checked) {
      setVisitData({
        ...visitData,
        appointmentVaccinationIds: [...visitData.appointmentVaccinationIds, appointmentVaccinationID],
      });
    } else {
      setVisitData({
        ...visitData,
        appointmentVaccinationIds: visitData.appointmentVaccinationIds.filter(
          (id) => id !== appointmentVaccinationID
        ),
      });
    }
  };

  const handleCreateVisit = async () => {
    setError(null);
    try {
      const visitDataWithAppointmentId = {
        ...visitData,
        appointmentID: parseInt(appointmentId, 10),
      };
      await createVisit(visitDataWithAppointmentId);
      await fetchVisits();
      await fetchAppointmentDetails();
      handleCloseVisitForm();
    } catch (err) {
      console.error("Error creating visit:", err);
      setError(`Không thể tạo lượt thăm: ${err.response?.data?.message || "Kiểm tra console để biết thêm chi tiết."}`);
    }
  };

  if (loading) {
    return (
      <LayoutStaff>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress size={60} />
        </Box>
      </LayoutStaff>
    );
  }

  if (error) {
    return (
      <LayoutStaff>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </LayoutStaff>
    );
  }

  if (!appointment) {
    return (
      <LayoutStaff>
        <Typography variant="h6" align="center" sx={{ mt: 3 }}>
          Không tìm thấy lịch hẹn.
        </Typography>
      </LayoutStaff>
    );
  }

  return (
    <LayoutStaff>
      <Box sx={{ padding: "40px 20px", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
        <Typography variant="h4" align="center" className="appointment-details-title">
          Chi Tiết Lịch Hẹn
        </Typography>

        <Paper className="appointment-details-paper">
          <Grid container spacing={4}>
            {/* Thông tin lịch hẹn */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: "#2c3e50", fontWeight: 600 }}>
                Thông Tin Lịch Hẹn
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography variant="body1">
                  <strong>Ngày Hẹn:</strong>{" "}
                  {appointment.appointmentDate
                    ? new Date(appointment.appointmentDate).toLocaleDateString("vi-VN")
                    : "N/A"}
                </Typography>
                <Typography variant="body1">
                  <strong>Trạng Thái:</strong>{" "}
                  <Chip
                    label={appointment.status}
                    sx={{
                      bgcolor:
                        appointment.status === "Đã hoàn thành lịch tiêm"
                          ? "#27ae60"
                          : appointment.status === "Lên lịch hoàn tất"
                          ? "#3498db"
                          : "#e67e22",
                      color: "#fff",
                    }}
                  />
                </Typography>
                <Typography variant="body1">
                  <strong>Tên người tiêm:</strong> {appointment.patientName}
                </Typography>
                <Typography variant="body1">
                  <strong>Ghi Chú:</strong> {appointment.notes || "Không có"}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ color: "#2c3e50", fontWeight: 600 }}>
                  Danh Sách Vắc-Xin
                </Typography>
                {appointment.appointmentVaccinations?.length > 3 && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setShowAllVaccinations(!showAllVaccinations)}
                  >
                    {showAllVaccinations
                      ? "Thu gọn"
                      : `Xem thêm (${appointment.appointmentVaccinations.length - 3})`}
                  </Button>
                )}
              </Box>
              <Grid container spacing={2}>
                {appointment.appointmentVaccinations
                  ?.slice(0, showAllVaccinations ? undefined : 3)
                  .map((vaccination) => (
                    <Grid item xs={12} sm={6} key={vaccination.appointmentVaccinationID}>
                      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {vaccination.vaccinationName}
                        </Typography>
                        <Typography variant="body2">Tổng Liều: {vaccination.totalDoses}</Typography>
                        <Typography variant="body2">Liều Còn Lại: {vaccination.dosesRemaining}</Typography>
                        <Typography variant="body2">Liều Đã Lên Lịch: {vaccination.dosesScheduled}</Typography>
                        <Typography variant="body2">Trạng Thái: {vaccination.status}</Typography>
                      </Paper>
                    </Grid>
                  ))}
              </Grid>
            </Grid>

            {/* Danh sách lượt thăm */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ color: "#2c3e50", fontWeight: 600 }}>
                  Danh Sách Lượt Thăm
                </Typography>
                {appointment.status !== "Lên lịch hoàn tất" && (
                  <Button variant="contained" color="primary" onClick={handleOpenVisitForm}>
                    Tạo Lượt Thăm
                  </Button>
                )}
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table aria-label="Visits table">
                  <TableHead>
                    <TableRow>
                      <TableCell className="appointment-details-table-header">Ngày Thăm</TableCell>
                      <TableCell className="appointment-details-table-header">Ghi Chú</TableCell>
                      <TableCell className="appointment-details-table-header">Trạng Thái</TableCell>
                      <TableCell className="appointment-details-table-header">Vắc-Xin</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visits.map((visit) => (
                      <TableRow key={visit.visitID}>
                        <TableCell className="appointment-details-table-cell">
                          {visit.visitDate ? new Date(visit.visitDate).toLocaleDateString("vi-VN") : "N/A"}
                        </TableCell>
                        <TableCell className="appointment-details-table-cell">{visit.notes || "Không có"}</TableCell>
                        <TableCell className="appointment-details-table-cell">
                          <Chip
                            label={visit.status}
                            sx={{
                              bgcolor: visit.status === "Completed" ? "#27ae60" : "#e67e22",
                              color: "#fff",
                            }}
                          />
                        </TableCell>
                        <TableCell className="appointment-details-table-cell">
                          {visit.visitVaccinations?.map((vaccination) => (
                            <Chip
                              key={vaccination.appointmentVaccinationID}
                              label={vaccination.vaccinationName}
                              sx={{ m: 0.5, bgcolor: "#3498db", color: "#fff" }}
                            />
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Paper>

        {/* Modal Tạo Lượt Thăm */}
        <Dialog open={visitFormOpen} onClose={handleCloseVisitForm} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: "#3498db", color: "#fff", fontWeight: 600 }}>
            Tạo Lượt Thăm
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Ngày Thăm"
              name="visitDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={visitData.visitDate}
              onChange={handleVisitInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Ghi Chú"
              name="notes"
              multiline
              rows={3}
              value={visitData.notes}
              onChange={handleVisitInputChange}
            />
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
              Chọn Vắc-Xin:
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: "auto", mt: 1 }}>
              {appointmentVaccinations.map((vaccination) => (
                <FormControlLabel
                  key={vaccination.appointmentVaccinationID}
                  control={
                    <Checkbox
                      checked={visitData.appointmentVaccinationIds.includes(
                        vaccination.appointmentVaccinationID
                      )}
                      onChange={(e) => handleVaccinationSelection(e, vaccination.appointmentVaccinationID)}
                    />
                  }
                  label={`${vaccination.vaccinationName} (Liều Đã Lên Lịch: ${vaccination.dosesScheduled})`}
                  sx={{ display: "block", mb: 1 }}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseVisitForm} variant="outlined" color="primary">
              Hủy
            </Button>
            <Button onClick={handleCreateVisit} variant="contained" color="primary">
              Tạo
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LayoutStaff>
  );
}

export default AppointmentDetails;