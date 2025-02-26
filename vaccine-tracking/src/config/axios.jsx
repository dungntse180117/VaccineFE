import axios from "axios";
const baseUrl = "https://localhost:7089";

const config = {
  baseUrl: baseUrl,
};

const api = axios.create(config);

api.defaults.baseURL = baseUrl;

// handle before call api
const handleBefore = (config) => {
  // handle hành động trước khi call API

  // lấy ra cái token và đính kèm theo cái request
  const token = localStorage.getItem("token")?.replaceAll("", "");
  config.headers["Authorization"] = "Bearer ${token}";
  return config;
};
api.interceptors.request.use(handleBefore, null);

export default api;