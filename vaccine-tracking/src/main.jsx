import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { StyledEngineProvider } from "@mui/joy/styles";
import AuthPage from "./pages/Login/AuthPage";
import HomePage from "./pages/Homepage/Homepage";
import ManageAccount from "./pages/ManageUser/ManageAccount";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./config/ProtectedRoute";
import UserProfile from "./pages/UserProfile/UserProfile";
import PatientManager from "./pages/PatientManager/PatientManager";
import ManageVaccine from "./pages/ManageVaccine/ManageVaccine";
import DiseaseManager from "./pages/DiseaseManager/DiseaseManager";
import VaccineList from "./pages/VaccineInfomation/VaccineList";
import VaccineDetail from "./pages/VaccineInfomation/VaccineDetail";
import ManageVaccinationService from "./pages/ManageVaccinationServices/ManageVaccinationService";
import VaccinationServiceList from "./pages/VaccineServiceInfomation/VaccinationServiceList";
import VaccinationServiceDetail from "./pages/VaccineServiceInfomation/VaccinationServiceDetail";
import RegistrationDetail from "./pages/RegistrationDetail/RegistrationDetail";
import ManageAppointment from "./pages/ManageAppointment/ManageAppointment";
import AppointmentDetails from "./pages/ManageAppointment/AppointmentDetails";
import ManageVisit from "./pages/ManageVisit/ManageVisit";
import ManageVisitDayChangeRequest from "./pages/ManageVisitDayChangeRequest/ManageVisitDayChangeRequest";
import PatientVisitManager from "./pages/PatientManager/PatientVisitManager";
import PatientHistoryVaccine from "./pages/PatientManager/PatientHistoryVaccine";
import VisitHistoryVaccine from "./pages/ManageVisit/VisitHistoryVaccine";
import Registration from "./pages/Registration/Registration";
import PaymentSuccess from "./pages/Registration/PaymentSuccess";
import PaymentFailed from "./pages/Registration/PaymentFailed";
import Dashboard from "./pages/DashBoard/DashBoard";
import HistoryRegistration from "./pages/ManageUser/HistoryRegistration";

const App = () => {
  return (
    <StyledEngineProvider injectFirst>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/vaccinelist" element={<VaccineList />} />
          <Route path="/vaccinationservicelist" element={<VaccinationServiceList />} />
          <Route path="/vaccinedetail/:vaccinationId" element={<VaccineDetail />} />
          <Route path="/vaccinationservicedetail/:id" element={<VaccinationServiceDetail />} />
          <Route path="/patient-visits/:patientId" element={<PatientVisitManager />} />
          <Route path="/patient-history-vaccine/:patientId" element={<PatientHistoryVaccine />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/history-registration/:accountId" element={<HistoryRegistration />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manageaccount"
            element={
              <ProtectedRoute requiredRole={1}>
                <ManageAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/managevaccine"
            element={
              <ProtectedRoute requiredRole={1}>
                <ManageVaccine />
              </ProtectedRoute>
            }
          />
          <Route path="/patientmanager" element={<PatientManager />} />
          <Route
            path="/diseasemanager"
            element={
              <ProtectedRoute requiredRole={1}>
                <DiseaseManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/managevaccinationservice"
            element={
              <ProtectedRoute requiredRole={1}>
                <ManageVaccinationService />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole={1}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrationdetail"
            element={
              <ProtectedRoute requiredRole={2}>
                <RegistrationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manageappointment"
            element={
              <ProtectedRoute requiredRole={2}>
                <ManageAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/:appointmentId"
            element={
              <ProtectedRoute requiredRole={2}>
                <AppointmentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/managevisit"
            element={
              <ProtectedRoute requiredRole={2}>
                <ManageVisit />
              </ProtectedRoute>
            }
          />
           <Route
            path="/managevisitdaychangerequest"
            element={
              <ProtectedRoute requiredRole={2}>
                <ManageVisitDayChangeRequest />
              </ProtectedRoute>
            }
          />
          <Route path="/visit-history-vaccine/:visitId" 
          element=
          {
          <ProtectedRoute requiredRole={2}>
          <VisitHistoryVaccine />
          </ProtectedRoute>
          } 
          />
        </Routes>
      </Router>
    </StyledEngineProvider>
  );
};

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);