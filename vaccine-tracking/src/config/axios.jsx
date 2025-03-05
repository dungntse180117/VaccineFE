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
// Các hàm API  
// 
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
export default api;