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
// Account API
export const getAccountById = async (id) => {
  try {
    const response = await api.get(`/api/Account/${id}`);
    return response.data; 
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error("Không tìm thấy tài khoản với ID này.");
      } else if (error.response.status === 500) {
        throw new Error("Lỗi server: Không thể lấy thông tin tài khoản.");
      } else {
        throw new Error(error.response.data.message || "Lỗi không xác định từ server.");
      }
    } else if (error.request) {
      throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
    } else {
      throw new Error(error.message || "Đã xảy ra lỗi không xác định.");
    }
  }
};
export const getAccountByEmail = async (email) => {
  try {
    const response = await api.get(`/api/Account/email/${email}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching account with email ${email}:`, error);
    throw error;
  }
};

export const updateAccount = async (id, data) => {
  try {
    const response = await api.put(`/api/Account/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating account with ID ${id}:`, error);
    throw error;
  }
};

export const changePassword = async (id, data) => {
  try {
    const response = await api.put(`/api/Account/${id}/change-password`, data);
    return response.data;
  } catch (error) {
    console.error(`Error changing password for account ID ${id}:`, error);
    throw error;
  }
};
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
// Visit API
export const getVisit = (id) => {
  return api.get(`/api/Visit/${id}`);
};

export const getVisits = () => {
  return api.get("/api/Visit");
};

export const createVisit = (data) => {
  return api.post("/api/Visit", data);
};

export const updateVisit = (id, data) => {
  return api.put(`/api/Visit/${id}`, data);
};

export const deleteVisit = (id) => {
  return api.delete(`/api/Visit/${id}`);
};

export const updateVisitStatus = (id, data) => {
  return api.put(`/api/Visit/${id}/status`, data);
};

export const getVisitsByAppointmentId = (appointmentId) => {
  return api.get(`/api/Visit/appointment/${appointmentId}`);
};

export const getVisitsByPatientId = (patientId) => {
  return api.get(`/api/Visit/patient/${patientId}`);
};

// Visit Day Change Request API
export const getVisitDayChangeRequest = (id) => {
  return api.get(`/api/VisitDayChangeRequest/${id}`);
};

export const getVisitDayChangeRequests = () => {
  return api.get("/api/VisitDayChangeRequest");
};

export const createVisitDayChangeRequest = (data) => {
  return api.post("/api/VisitDayChangeRequest", data);
};

export const updateVisitDayChangeRequest = (id, data) => {
  return api.put(`/api/VisitDayChangeRequest/${id}`, data);
};

export const deleteVisitDayChangeRequest = (id) => {
  return api.delete(`/api/VisitDayChangeRequest/${id}`);
};

export const getVisitDayChangeRequestsByVisitId = (visitId) => {
  return api.get(`/api/VisitDayChangeRequest/visit/${visitId}`);
};
// VaccinationHistory API
export const getVaccinationHistory = async (id) => {
  try {
    const response = await api.get(`/api/VaccinationHistory/${id}`); 
    return response.data;
  } catch (error) {
    console.error(`Error getting vaccination history with ID ${id}:`, error);
    throw error;
  }
};

export const getAllVaccinationHistories = async () => {
  try {
    const response = await api.get("/api/VaccinationHistory");
    return response.data;
  } catch (error) {
    console.error('Error getting all vaccination histories:', error);
    throw error;
  }
};

export const updateVaccinationHistory = async (id, requestData) => {
  try {
    const response = await api.put(`/api/VaccinationHistory/${id}`, requestData);
    return response.data;
  } catch (error) {
    console.error(`Error updating vaccination history with ID ${id}:`, error);
    throw error;
  }
};

export const deleteVaccinationHistory = async (id) => {
  try {
    await api.delete(`/api/VaccinationHistory/${id}`); 
    return;
  } catch (error) {
    console.error(`Error deleting vaccination history with ID ${id}:`, error);
    throw error;
  }
};

export const getVaccinationHistoriesByPatientId = async (patientId) => {
  try {
    const response = await api.get(`/api/VaccinationHistory/patient/${patientId}`);
    return response; 
  } catch (error) {
    console.error(`Error getting vaccination histories by patient ID ${patientId}:`, error);
    throw error;
  }
};

export const getVaccinationHistoriesByVisitId = async (visitId) => {
  try {
    const response = await api.get(`/api/VaccinationHistory/visit/${visitId}`);
    return response.data;  
  } catch (error) {
    console.error(`Error getting vaccination histories by visit ID ${visitId}:`, error);
    throw error;
  }
};
// Registrations API
export const createRegistration = async (data) => {
  try {
    const response = await api.post("/api/Registrations", data);
    return response.data; 
  } catch (error) {
    console.error("Error creating registration:", error);
    throw error; 
  }
};

export const getRegistration = (id) => {
  return api.get(`/api/Registrations/${id}`);
};

export const updateRegistration = (id, data) => {
  return api.put(`/api/Registrations/${id}`, data);
};
export const updateRegistrationStatus = (id, data) => {
    return api.put(`/api/Registrations/${id}/status`, data);
};

export const deleteRegistration = (id) => {
  return api.delete(`/api/Registrations/${id}`);
};


export const getAllRegistrationsByAccountId = async (accountId) => {
  try {
    const response = await api.get(`/api/Registrations/account/${accountId}`); 
    return response.data;
  } catch (error) {
    console.error(`Error fetching registrations for accountId ${accountId}:`, error);
    throw error;
  }
};

export const getPatientsByPhone = async (phone, accountId) => {
  try {
    const response = await api.get(`/api/Patients/byphone/${phone}/${accountId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Server responded with error:", error.response.status, error.response.data);
      throw new Error(error.response.data || "Server Error");
    } else if (error.request) {
      console.error("No response received:", error.request);
      throw new Error("Network Error");
    } else {
      console.error("Request setup error:", error.message);
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
};

export const getAllVaccinationRegistration = async () => {
  try {
      const response = await api.get("/api/Vaccinations");
      console.log("getAllVaccinationRegistration response.data:", response.data); 
      return response.data; 
  } catch (error) {
      console.error("getAllVaccinationRegistration: Error fetching vaccinations:", error);
      if (error.response) {
          console.error("Server responded with error:", error.response.status, error.response.data);
          throw new Error(error.response.data || "Server Error");
      } else if (error.request) {
          console.error("No response received:", error.request);
          throw new Error("Network Error");
      } else {
          console.error("Request setup error:", error.message);
          throw new Error(error.message || "An unexpected error occurred");
      }
  }
};

export const getAllVaccinationServicesRegistration = async () => {
  try {
      const response = await api.get("/api/VaccinationServices");
      console.log("getAllVaccinationServicesRegistration response.data:", response.data); 
      return response.data;
  } catch (error) {
      console.error("getAllVaccinationServicesRegistration: Error fetching services:", error);
       if (error.response) {
          console.error("Server responded with error:", error.response.status, error.response.data);
          throw new Error(error.response.data || "Server Error");
      } else if (error.request) {
           console.error("No response received:", error.request);
          throw new Error("Network Error");
      } else {
          console.error("Request setup error:", error.message);
          throw new Error(error.message || "An unexpected error occurred");
      }
  }
};

// Thanh toán API
export const createPayment = async (registrationId) => {
  try {
    const response = await api.post('/api/VnPay/CreatePayment', { registrationId });
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

export const executePayment = async (queryParams) => {
  try {
    const response = await api.get(`/api/VnPay/PaymentExecute`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error("Error executing payment:", error);
    throw error;
  }
};
//DashBoard API
export const getRevenuePerMonth = (year) => {
  return api.get(`/api/Dashboard/RevenuePerMonth?year=${year}`); 
};

export const getVisitsPerMonth = (year) => {
  return api.get(`/api/Dashboard/VisitsPerMonth?year=${year}`); 
};

export const getMostPurchasedVaccine = () => {
  return api.get('/api/Dashboard/MostPurchasedVaccine');
};

export const getMostPurchasedPackage = () => {
  return api.get('/api/Dashboard/MostPurchasedPackage'); 
};

export default api;