import axios from "axios";
const axiosInstance = axios.create({
  baseURL: "http://localhost:5001" || window.location.origin,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const cmshrmstoken = localStorage.getItem("cmshrmstoken");
    if (cmshrmstoken) {
      config.headers.Authorization = `Bearer ${cmshrmstoken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
