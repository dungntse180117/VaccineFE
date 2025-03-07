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

export default api;