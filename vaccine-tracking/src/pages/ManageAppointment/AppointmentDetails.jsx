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
  // State cho Dialog Change Requests - No longer needed, you can remove these lines
  // const [changeRequestsDialogOpen, setChangeRequestsDialogOpen] = useState(false);
  // const [selectedVisitChangeRequests, setSelectedVisitChangeRequests] = useState([]);
  // const [loadingChangeRequests, setLoadingChangeRequests] = useState(false); // Loading state for Change Requests Dialog

  const fetchVisits = useCallback(async () => {
    try {
      const response = await getVisitsByAppointmentId(appointmentId);
      console.log("Visits Data:", response?.data);
      if (Array.isArray(response?.data)) {
        setVisits(response?.data);
        console.log("Visits State After Fetch (Raw Data):", response?.data);
      } else {
        console.warn("No visits found or unexpected data format. Setting visits to empty array.");
        setVisits([]);
      }
    } catch (err) {
      console.error("Error fetching visits:", err);
      setError("Failed to load visits.");
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
      setError("Failed to load appointment details.");
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
    setVisitData({
      ...visitData,
      [name]: value,
    });
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
      console.log("Visit Created Successfully");
      await fetchVisits();
      await fetchAppointmentDetails();
      handleCloseVisitForm();
    } catch (err) {
      console.error("Error creating visit:", err);
      setError("Failed to create visit.");
      if (err.response) {
        console.error("Backend response on visit creation error:", err.response.data);
        setError(`Failed to create visit. ${err.response.data?.message || "Please check console for details."}`);
      } else {
        setError("Failed to create visit. Please check console for details.");
      }
    }
  };

  // No longer needed, you can remove these functions
  // const handleOpenChangeRequestsDialog = async (visitId) => { // Modified function to take visitId
  //   setLoadingChangeRequests(true); // Set loading state
  //   try {
  //     const response = await getVisitDayChangeRequestsByVisitId(visitId); // Call API to fetch requests for visitId
  //     setSelectedVisitChangeRequests(response.data); // Set fetched requests to state
  //     setChangeRequestsDialogOpen(true); // Open Dialog
  //   } catch (error) {
  //     console.error("Error fetching visit day change requests:", error);
  //     setError("Failed to load visit day change requests.");
  //   } finally {
  //     setLoadingChangeRequests(false); // Clear loading state
  //   }
  // };

  // const handleCloseChangeRequestsDialog = () => {
  //   setChangeRequestsDialogOpen(false);
  // };

  if (loading) {
    return (
      <LayoutStaff>
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Box>
      </LayoutStaff>
    );
  }

  if (error) {
    return (
      <LayoutStaff>
        <Alert severity="error">{error}</Alert>
      </LayoutStaff>
    );
  }

  if (!appointment) {
    return (
      <LayoutStaff>
        <Typography variant="h6" align="center">
          Appointment not found.
        </Typography>
      </LayoutStaff>
    );
  }

  return (
    <LayoutStaff>
      <Box padding={3}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          className="appointment-details-title"
          marginBottom={3}
        >
          Appointment Details
        </Typography>

        <Paper elevation={3} className="appointment-details-paper" style={{ padding: 16 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Appointment Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Appointment ID: <strong>{appointment?.appointmentID}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Appointment Date:{" "}
                    <strong>
                      {appointment?.appointmentDate
                        ? new Date(appointment?.appointmentDate).toLocaleDateString()
                        : "N/A"}
                    </strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Status: <strong>{appointment?.status}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Patient ID: <strong>{appointment?.patientId}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Patient Name: <strong>{appointment?.patientName}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Notes: <strong>{appointment?.notes}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" mt={0} gutterBottom>
                  Vaccinations
                </Typography>
                {appointment?.appointmentVaccinations?.length > 3 && (
                  <Button size="small" onClick={() => setShowAllVaccinations(!showAllVaccinations)}>
                    {showAllVaccinations ? "Thu gọn" : `Xem thêm (${appointment.appointmentVaccinations.length - 3} +)`}
                  </Button>
                )}
              </Box>
              <Grid container spacing={2} mt={1}>
                {appointment?.appointmentVaccinations
                  ?.slice(0, showAllVaccinations ? appointment.appointmentVaccinations.length : 3)
                  ?.map((vaccination) => (
                    <Grid item xs={12} sm={6} md={6} lg={4} key={vaccination?.appointmentVaccinationID}>
                      <Paper elevation={2} style={{ padding: 16 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          <strong>{vaccination?.vaccinationName}</strong>
                        </Typography>
                        <Typography variant="body2">
                          Total Doses: {vaccination?.totalDoses}
                        </Typography>
                        <Typography variant="body2">
                          Doses Remaining: {vaccination?.dosesRemaining}
                        </Typography>
                        <Typography variant="body2">
                          Doses Scheduled: {vaccination?.dosesScheduled}
                        </Typography>
                        <Typography variant="body2">
                          Status: {vaccination?.status}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
              </Grid>
            </Grid>
          </Grid>

          <Box mt={3} mb={1} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" gutterBottom>
              Visits
            </Typography>
            {appointment?.status !== "Lên lịch hoàn tất" && (
              <Button variant="contained" color="primary" onClick={handleOpenVisitForm}>
                Create Visit
              </Button>
            )}
          </Box>
          <TableContainer component={Paper} elevation={1}>
            <Table aria-label="Visits table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Visit Date</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Vaccinations</TableCell>
                  {/* Remove Actions Column Header */}
                </TableRow>
              </TableHead>
              <TableBody>
                {visits?.map((visit) => (
                  <TableRow key={visit?.visitID}>
                    <TableCell>
                      {visit?.visitDate ? new Date(visit.visitDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>{visit?.notes}</TableCell>
                    <TableCell>{visit?.status}</TableCell>
                    <TableCell>{/* Actions Cell */}
                      {visit?.visitVaccinations?.map((vaccination) => (
                        <Chip
                          key={vaccination?.appointmentVaccinationID}
                          label={vaccination?.vaccinationName}
                          style={{ margin: "2px" }}
                        />
                      ))}
                    </TableCell>
                    {/* Remove Actions Column Data */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Remove Change Requests Dialog COMPLETELY */}
        {/* <Dialog open={changeRequestsDialogOpen} onClose={handleCloseChangeRequestsDialog}>
          </Dialog> */}

        {/* Create Visit Form Dialog (giữ nguyên) */}
        <Dialog open={visitFormOpen} onClose={handleCloseVisitForm}>
          <DialogTitle>Create Visit</DialogTitle>
          <DialogContent>
            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              <TextField
                fullWidth
                margin="normal"
                label="Visit Date"
                name="visitDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={visitData.visitDate || ""}
                onChange={handleVisitInputChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={visitData.notes || ""}
                onChange={handleVisitInputChange}
              />
              <Typography variant="subtitle1" mt={2}>
                Select Vaccinations:
              </Typography>
              {appointmentVaccinations?.map((vaccination) => (
                <FormControlLabel
                  key={vaccination?.appointmentVaccinationID}
                  control={
                    <Checkbox
                      checked={visitData.appointmentVaccinationIds.includes(
                        vaccination?.appointmentVaccinationID
                      )}
                      onChange={(e) =>
                        handleVaccinationSelection(e, vaccination?.appointmentVaccinationID)
                      }
                    />
                  }
                  label={`${vaccination.vaccinationName} (Doses Scheduled: ${vaccination.dosesScheduled})`}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseVisitForm}>Cancel</Button>
            <Button color="primary" onClick={handleCreateVisit}>
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LayoutStaff>
  );
}

export default AppointmentDetails;