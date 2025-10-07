import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";

const API_URL =
  /* import.meta.env.MODE === "production"
    ? "https://corn-films.onrender.com/api/v1"
    : */ "http://localhost:3001/api/v1";

const privateClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

privateClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Reject tất cả các error, không chỉ 401
    return Promise.reject(error);
  }
);

export default privateClient;
