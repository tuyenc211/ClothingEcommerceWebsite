import axios, { AxiosError } from "axios";

// const API_URL =
//   process.env.NODE_ENV === "development"
//     ? "http://localhost:8088/api/v1"
//     : "/api/v1";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
const privateClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Tự động gửi cookie (accessToken) với mỗi request
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor - Handle redirect khi 401 cho dashboard-admin
privateClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const isAuthPage = path.startsWith("/login");

        // Chỉ redirect nếu KHÔNG ở trang auth
        if (!isAuthPage) {
          localStorage.removeItem("auth-storage");
          window.location.replace("/login");
        } else {
          // Ở trang auth: chỉ clear state, đừng redirect
          localStorage.removeItem("auth-storage");
        }
      }
    }
    return Promise.reject(error);
  }
);
export default privateClient;
