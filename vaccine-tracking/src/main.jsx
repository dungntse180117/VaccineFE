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
            <Route path="/patientmanager" element={<PatientManager/>} /> 
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