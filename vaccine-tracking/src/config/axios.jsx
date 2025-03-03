import axios from "axios";

const baseURL = "https://localhost:7089"; // Đổi tên thành baseURL

const config = {
  baseURL: baseURL, // Sử dụng baseURL
};

const api = axios.create(config);

api.defaults.baseURL = baseURL; // Sử dụng baseURL

// handle before call api
const handleBefore = (config) => {
  // handle hành động trước khi call API

  // lấy ra cái token và đính kèm theo cái request
  const token = localStorage.getItem("token"); // Lấy token
  config.headers["Authorization"] = `Bearer ${token}`; // Sử dụng backtick
  return config;
};

api.interceptors.request.use(
  handleBefore,
  (error) => {
    // Xử lý lỗi interceptor
    console.error("Interceptor error:", error);
    return Promise.reject(error); // Chuyển lỗi cho các request sau
  }
);

export default api;