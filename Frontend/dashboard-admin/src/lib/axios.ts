// libs/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import useAuthStore from "@/stores/useAuthStore";

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
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
    const path = window.location.pathname;
    const isAuthPage = path.startsWith("/login");
    // Đang gọi refresh endpoint -> clear token và reject (tránh loop)
    if (originalRequest.url?.includes("/auth/refresh") || isAuthPage) {
      useAuthStore.getState().setAccessToken(null);
      return Promise.reject(error);
    }

    // Đánh dấu đã retry
    originalRequest._retry = true;

    try {
      // Gọi endpoint refresh để lấy access token mới
      const response = await privateClient.get("/auth/refresh");
      const newAccessToken = response.data.accesstoken;

      // Cập nhật token mới vào Zustand (persist middleware tự động lưu vào localStorage)
      useAuthStore.getState().setAccessToken(newAccessToken);

      // Retry request ban đầu với token mới
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return privateClient(originalRequest);
    } catch (refreshError) {
      // Refresh token hết hạn -> clear token
      useAuthStore.getState().setAccessToken(null);

      // Xóa cart nếu cần
      localStorage.removeItem("auth-storage");

      // Redirect về login
      window.location.replace("/user/login");
      return Promise.reject(refreshError);
    }
  }
);

export default privateClient;
