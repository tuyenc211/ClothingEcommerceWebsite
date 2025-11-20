// libs/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8088/api/v1"
    : "/api/v1";

const privateClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: Thêm access token vào header
privateClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        const accessToken = state?.accessToken;

        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error("Error parsing auth storage:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Xử lý 401 và refresh token
privateClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Không phải lỗi 401 hoặc đã retry rồi -> reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Đang ở trang auth hoặc đang gọi refresh -> không xử lý
    const path = window.location.pathname;
    const isAuthPage =
      path.startsWith("/user/login") ||
      path.startsWith("/user/signup") ||
      path.startsWith("/user/forgot-password") ||
      path.startsWith("/user/reset-password");

    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");

    if (isAuthPage || isRefreshEndpoint) {
      localStorage.removeItem("auth-storage");
      return Promise.reject(error);
    }

    // Đánh dấu đã retry để tránh loop
    originalRequest._retry = true;

    try {
      // Gọi endpoint refresh để lấy access token mới
      const response = await privateClient.get("/auth/refresh");
      const newAccessToken = response.data.accesstoken;

      // Cập nhật access token vào localStorage
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        parsed.state.accessToken = newAccessToken;
        localStorage.setItem("auth-storage", JSON.stringify(parsed));
      }

      // Retry request ban đầu với token mới
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return privateClient(originalRequest);
    } catch (refreshError) {
      // Refresh token hết hạn -> clear data và redirect
      localStorage.removeItem("auth-storage");
      window.location.replace("/user/login");
      return Promise.reject(refreshError);
    }
  }
);

export default privateClient;
