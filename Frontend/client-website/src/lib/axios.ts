import axios, { AxiosError } from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088/api/v1";

const privateClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Tự động gửi cookie (accessToken) với mỗi request
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor - Chỉ handle redirect khi 401
privateClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth state
      if (typeof window !== "undefined") {
        // Có thể clear localStorage nếu cần
        localStorage.removeItem("auth-storage");

        // Redirect về login
        window.location.href = "/user/login";
      }
    }

    return Promise.reject(error);
  }
);

export default privateClient;
