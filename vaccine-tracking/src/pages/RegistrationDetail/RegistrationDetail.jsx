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
} from "@mui/material";
import LayoutStaff from "../../components/Layout/LayoutStaff";
import "./RegistrationDetail.css";
import {
  getAllRegistrationDetails,
  createAppointment,
} from "../../config/axios";

function RegistrationDetail() {
  const [registrationDetails, setRegistrationDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false); // Modal state
  const [selectedRegistrationDetailId, setSelectedRegistrationDetailId] =
    useState(null);
  const [appointmentData, setAppointmentData] = useState({
    registrationDetailID: null,
    appointmentDate: null,
    notes: "",
  });
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all"); // "all", "pending", "scheduled"
  const [filteredRegistrationDetails, setFilteredRegistrationDetails] = useState([]);

  useEffect(() => {
    fetchRegistrationDetails();
  }, []);

  useEffect(() => {
      // Update filtered registration details whenever the status filter or registration details change
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
        setError("Invalid data format from API.");
      }
    } catch (err) {
      console.error("Error fetching registration details:", err);
      setError("Failed to load registration details.");
    } finally {
      setLoading(false);
    }
  };

  const applyStatusFilter = () => {
    let filtered = [...registrationDetails];
    if (selectedStatusFilter === "pending") {
      filtered = filtered.filter(
        (detail) => detail.status !== "Đã tạo lịch tổng quát"
      );
    } else if (selectedStatusFilter === "scheduled") {
      filtered = filtered.filter(
        (detail) => detail.status === "Đã tạo lịch tổng quát"
      );
    }
    setFilteredRegistrationDetails(filtered);
  };

  const handleOpen = (registrationDetailId) => {
    setSelectedRegistrationDetailId(registrationDetailId);
    setAppointmentData({
      registrationDetailID: registrationDetailId,
      appointmentDate: new Date().toISOString().slice(0, 10), // Set initial date
      notes: "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData({
      ...appointmentData,
      [name]: value,
    });
  };

  const handleCreateAppointment = async () => {
    try {
      await createAppointment(appointmentData);
      handleClose();
      fetchRegistrationDetails(); // Refresh
    } catch (err) {
      console.error("Error creating appointment:", err);
      setError("Failed to create appointment.");
    }
  };

  const handleStatusFilterChange = (event) => {
    setSelectedStatusFilter(event.target.value);
  };

  return (
    <LayoutStaff>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        className="registration-detail-title"
      >
        Danh sách Chi Tiết Đăng Ký
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {/* Status Filter */}
      <Box sx={{ minWidth: 120, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={selectedStatusFilter}
            label="Status"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} className="registration-detail-table-container">
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
          <Table sx={{ minWidth: 800 }} aria-label="registration detail table">
            <TableHead>
              <TableRow>
                <TableCell className="registration-detail-table-header">
                  Patient ID
                </TableCell>
                <TableCell className="registration-detail-table-header">
                  Quantity
                </TableCell>
                <TableCell className="registration-detail-table-header">
                  Price
                </TableCell>
                <TableCell className="registration-detail-table-header">
                  Desired Date
                </TableCell>
                <TableCell className="registration-detail-table-header">
                  Status
                </TableCell>
                <TableCell className="registration-detail-table-header">
                  Account ID
                </TableCell>
                <TableCell className="registration-detail-table-header">
                  Service Name
                </TableCell>
                <TableCell className="registration-detail-table-header">
                  Vaccination Names
                </TableCell>
                <TableCell className="registration-detail-table-header">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRegistrationDetails.map((detail) => (
                <TableRow key={detail.registrationDetailID}>
                  <TableCell className="registration-detail-table-cell">
                    {detail.patientId}
                  </TableCell>
                  <TableCell className="registration-detail-table-cell">
                    {detail.quantity}
                  </TableCell>
                  <TableCell className="registration-detail-table-cell">
                    {detail.price}
                  </TableCell>
                  <TableCell className="registration-detail-table-cell">
                    {detail.desiredDate ? new Date(detail.desiredDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="registration-detail-table-cell">
                    {detail.status}
                  </TableCell>
                  <TableCell className="registration-detail-table-cell">
                    {detail.accountId}
                  </TableCell>
                  <TableCell className="registration-detail-table-cell">
                    {detail.serviceName}
                  </TableCell>
                  <TableCell className="registration-detail-table-cell">
                    {detail.vaccinationNames ? detail.vaccinationNames.join(", ") : "N/A"}
                  </TableCell>
                  <TableCell className="registration-detail-table-cell">
                    {detail.status !== "Đã tạo lịch tổng quát" ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpen(detail.registrationDetailID)}
                      >
                        Create Appointment
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create Appointment</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              margin="normal"
              label="Appointment Date"
              name="appointmentDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={appointmentData.appointmentDate || ""}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Notes"
              name="notes"
              multiline
              rows={3}
              value={appointmentData.notes || ""}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button color="primary" onClick={handleCreateAppointment}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </LayoutStaff>
  );
}

export default RegistrationDetail;