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

// Refresh token queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token?: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token || undefined);
    }
  });
  failedQueue = [];
};

// Request interceptor: Đính kèm access token
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

    // Đang ở trang auth hoặc đang gọi refresh -> không xử lý
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const isAuthPage =
        path.startsWith("/user/login") ||
        path.startsWith("/user/signup") ||
        path.startsWith("/user/forgot-password") ||
        path.startsWith("/user/reset-password");

      const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");

      if (isAuthPage || isRefreshEndpoint) {
        // Clear cả Zustand store và localStorage
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    // Nếu đang refresh, đưa request vào queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return privateClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Bắt đầu refresh token
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await privateClient.get("/auth/refresh");
      const newAccessToken = response.data.accesstoken;

      // Cập nhật token mới vào Zustand (persist middleware sẽ tự lưu vào localStorage)
      useAuthStore.getState().setAccessToken(newAccessToken);

      // Process queue với token mới
      processQueue(null, newAccessToken);

      // Retry request ban đầu với token mới
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return privateClient(originalRequest);
    } catch (refreshError) {
      // Refresh token hết hạn hoặc không hợp lệ
      processQueue(refreshError, null);

      // QUAN TRỌNG: Clear toàn bộ auth state (bao gồm cả localStorage)
      useAuthStore.getState().logout();

      // Redirect về login
      if (typeof window !== "undefined") {
        window.location.replace("/user/login");
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default privateClient;
