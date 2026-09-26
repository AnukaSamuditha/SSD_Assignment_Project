import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER,
  withCredentials: true,
});

export default axiosInstance;
