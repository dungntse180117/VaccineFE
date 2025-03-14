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
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material"; // Import Visibility icon
import LayoutStaff from "../../components/Layout/LayoutStaff";
import "./ManageAppointment.css";
import {
  getAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../config/axios"; // Import the API functions
import { useNavigate } from "react-router-dom"; // Import useNavigate

function ManageAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    appointmentDate: null,
    notes: "",
  });

  const navigate = useNavigate(); // Initialize useNavigate

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
      } else {
        setError("Invalid data format from API.");
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().slice(0, 10) : '',
      notes: appointment.notes,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdateAppointment = async () => {
    try {
      await updateAppointment(selectedAppointment.appointmentID, formData);
      fetchAppointments(); // Refresh data
      handleClose();
    } catch (err) {
      console.error("Error updating appointment:", err);
      setError("Failed to update appointment.");
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      await deleteAppointment(id);
      fetchAppointments(); // Refresh data
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError("Failed to delete appointment.");
    }
  };

  const handleViewDetails = (appointmentId) => {
    navigate(`/appointments/${appointmentId}`); // Navigate to appointment details page
  };

  return (
    <LayoutStaff>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        className="appointment-manager-title"
      >
        Quản lý Lịch Hẹn
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} className="appointment-manager-table-container">
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
          <Table sx={{ minWidth: 800 }} aria-label="appointment table">
            <TableHead>
              <TableRow>
                <TableCell className="appointment-manager-table-header">
                  Appointment ID
                </TableCell>
                <TableCell className="appointment-manager-table-header">
                  Registration Detail ID
                </TableCell>
                <TableCell className="appointment-manager-table-header">
                  Appointment Date
                </TableCell>
                <TableCell className="appointment-manager-table-header">
                  Status
                </TableCell>
                <TableCell className="appointment-manager-table-header">
                  Notes
                </TableCell>
                <TableCell className="appointment-manager-table-header">
                  Patient ID
                </TableCell>
                 <TableCell className="appointment-manager-table-header">
                  Patient Name
                </TableCell>
                <TableCell className="appointment-manager-table-header">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.appointmentID}>
                  <TableCell className="appointment-manager-table-cell">
                    {appointment.appointmentID}
                  </TableCell>
                  <TableCell className="appointment-manager-table-cell">
                    {appointment.registrationDetailID}
                  </TableCell>
                  <TableCell className="appointment-manager-table-cell">
                    {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="appointment-manager-table-cell">
                    {appointment.status}
                  </TableCell>
                  <TableCell className="appointment-manager-table-cell">
                    {appointment.notes}
                  </TableCell>
                   <TableCell className="appointment-manager-table-cell">
                    {appointment.patientId}
                  </TableCell>
                   <TableCell className="appointment-manager-table-cell">
                    {appointment.patientName}
                  </TableCell>
                  <TableCell className="appointment-manager-table-cell">
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetails(appointment.appointmentID)}
                    >
                      <Visibility /> {/* View Details Icon */}
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(appointment)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDeleteAppointment(appointment.appointmentID)}
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

      {/* Update Appointment Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Appointment</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              margin="normal"
              label="Appointment Date"
              name="appointmentDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.appointmentDate || ""}
              onChange={handleInputChange}
            />
           <TextField
              fullWidth
              margin="normal"
              label="Notes"
              name="notes"
              multiline
              rows={3}
              value={formData.notes || ""}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button color="primary" onClick={handleUpdateAppointment}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </LayoutStaff>
  );
}

export default ManageAppointment;