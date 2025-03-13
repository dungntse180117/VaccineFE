import axios from "axios";

const baseURL = "https://localhost:7089";

const config = {
  baseURL: baseURL,
};

const api = axios.create(config);

api.defaults.baseURL = baseURL;

const handleBefore = (config) => {
  const token = localStorage.getItem("token");
  config.headers["Authorization"] = `Bearer ${token}`;
  return config;
};

api.interceptors.request.use(
  handleBefore,
  (error) => {
    console.error("Interceptor error:", error);
    return Promise.reject(error);
  }
);

// Patient API
export const createPatient = (data) => {
  return api.post("/api/Patients", data);
};

export const getPatientById = (id) => {
  return api.get(`/api/Patients/${id}`);
};

export const getAllPatients = () => {
  return api.get("/api/Patients");
};

export const getAllPatientsByAccountId = (accountId) => {
  return api.get(`/api/Patients/byaccount/${accountId}`);
};

export const updatePatient = (id, data) => {
  return api.put(`/api/Patients/${id}`, data);
};

export const deletePatient = (id) => {
  return api.delete(`/api/Patients/${id}`);
};

// Vaccinations API
export const getAllVaccination = () => {
  return api.get("/api/Vaccinations");
};

export const createVaccinationt = (data) => {
  return api.post("/api/Vaccinations", data);
};

export const getVaccinationId = (id) => {
  return api.get(`/api/Vaccinations/${id}`);
};

export const updateVaccination = (id, data) => {
  return api.put(`/api/Vaccinations/${id}`, data);
};

export const deleteVaccination = (id) => {
  return api.delete(`/api/Vaccinations/${id}`);
};

// API Vaccination Image
export const createVaccinationImage = async (file, vaccinationId) => {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("VaccinationId", vaccinationId);
  formData.append("AccountId", 1);

  try {
    const response = await api.post("/api/UploadImage/UploadFile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const getVaccinationImage = (vaccinationId) => {
  return api.get(`/api/UploadImage/GetVaccinationImage/${vaccinationId}`);
};

// Disease API functions
export const getAllDiseases = async () => {
  try {
    const response = await api.get("/api/Disease");
    return response.data;
  } catch (error) {
    console.error("Error fetching all diseases:", error);
    throw error;
  }
};

export const getDiseaseById = async (id) => {
  try {
    const response = await api.get(`/api/Disease/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching disease with ID ${id}:`, error);
    throw error;
  }
};

export const createDisease = async (diseaseData) => {
  try {
    const response = await api.post("/api/Disease", diseaseData);
    return response.data;
  } catch (error) {
    console.error("Error creating disease:", error);
    throw error;
  }
};

export const updateDisease = async (id, diseaseData) => {
  try {
    await api.put(`/api/Disease/${id}`, diseaseData);
    return;
  } catch (error) {
    console.error(`Error updating disease with ID ${id}:`, error);
    throw error;
  }
};

export const deleteDisease = async (id) => {
  try {
    await api.delete(`/api/Disease/${id}`);
    return;
  } catch (error) {
    console.error(`Error deleting disease with ID ${id}:`, error);
    throw error;
  }
};

export const getDiseaseByVaccinationId = async (vaccinationId) => {
  try {
    const response = await api.get(`/api/Disease/GetDiseaseByVaccinationId/${vaccinationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error connecting diseases with vaccinations:`, error.message);
    throw error;
  }
};

export const createVaccinationDisease = async (vaccinationId, diseaseId) => {
  try {
    const response = await api.post(`/api/Disease/${vaccinationId}/AssociateDiseases/${diseaseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error associating disease ${diseaseId} with vaccination ${vaccinationId}:`, error);
    throw error;
  }
};
// Vaccination Service API
export const getAllVaccinationServices = () => {
  return api.get("/api/VaccinationServices");
};

export const getVaccinationServiceById = (id) => {
  return api.get(`/api/VaccinationServices/${id}`);
};

export const createVaccinationService = (data) => {
  return api.post("/api/VaccinationServices", data);
};

export const updateVaccinationService = (id, data) => {
  return api.put(`/api/VaccinationServices/${id}`, data);
};

export const deleteVaccinationService = (id) => {
  return api.delete(`/api/VaccinationServices/${id}`);
};

export const createVaccinationServiceVaccination = (data) => {
  return api.post("/api/VaccinationServices/vaccination", data);
};

export const deleteVaccinationServiceVaccination = (data) => {
  return api.delete("/api/VaccinationServices/vaccination", { data: data });
};
//RegistrationDetail API
const API_BASE_URL = '/api/RegistrationDetails'; // Define the base URL here
export const getAllRegistrations = async () => {  // Add "export"
  try {
    const response = await api.get("/api/Registrations"); // Or whatever the correct endpoint is
    return response.data;
  } catch (error) {
    console.error("Error fetching all registrations:", error);
    throw error;
  }
};
export const createRegistrationDetail = async (requestData) => {
  try {
    const response = await api.post(API_BASE_URL, requestData);
    return response.data;
  } catch (error) {
    console.error('Error creating registration detail:', error);
    throw error;
  }
};

export const getRegistrationDetail = async (id) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting registration detail with ID ${id}:`, error);
    throw error;
  }
};

export const getAllRegistrationDetails = async () => {
  try {
    const response = await api.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error getting all registration details:', error);
    throw error;
  }
};

export const updateRegistrationDetail = async (id, requestData) => {
  try {
    const response = await api.put(`${API_BASE_URL}/${id}`, requestData);
    return response.data;
  } catch (error) {
    console.error(`Error updating registration detail with ID ${id}:`, error);
    throw error;
  }
};

export const deleteRegistrationDetail = async (id) => {
  try {
    await api.delete(`${API_BASE_URL}/${id}`);
    return;
  } catch (error) {
    console.error(`Error deleting registration detail with ID ${id}:`, error);
    throw error;
  }
};
//Appointment API
const APPOINTMENT_BASE_URL = '/api/Appointment';

export const getAppointmentDetail = async (id) => {
  try {
    const response = await api.get(`${APPOINTMENT_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting appointment detail with ID ${id}:`, error);
    throw error;
  }
};

export const getAppointment = async () => {
  try {
    const response = await api.get(APPOINTMENT_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
};

export const createAppointment = async (requestData) => {
  try {
    const response = await api.post(APPOINTMENT_BASE_URL, requestData);
    return response.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const updateAppointment = async (id, requestData) => {
  try {
    await api.put(`${APPOINTMENT_BASE_URL}/${id}`, requestData);
    return;
  } catch (error) {
    console.error(`Error updating appointment with ID ${id}:`, error);
    throw error;
  }
};

export const deleteAppointment = async (id) => {
  try {
    await api.delete(`${APPOINTMENT_BASE_URL}/${id}`);
    return;
  } catch (error) {
    console.error(`Error deleting appointment with ID ${id}:`, error);
    throw error;
  }
};

export const getAppointmentVaccinations = async (appointmentId) => {
  try {
    const response = await api.get(`${APPOINTMENT_BASE_URL}/${appointmentId}/vaccinations`);
    return response.data;
  } catch (error) {
    console.error(`Error getting appointment vaccinations for appointment ID ${appointmentId}:`, error);
    throw error;
  }
};

export const getRegistrationsWithAppointmentsByAccountId = async (accountId) => {
  try {
    const response = await api.get(`${APPOINTMENT_BASE_URL}/account/${accountId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting registrations with appointments for account ID ${accountId}:`, error);
    throw error;
  }
};


export default api;