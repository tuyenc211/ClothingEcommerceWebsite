import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8088/api/v1"
    : "/api/v1";
// const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
const privateClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Biến để track refresh token đang chạy
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - Thêm access token vào header
privateClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy access token từ localStorage
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

// Response interceptor - Handle refresh token khi 401
privateClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang ở trang auth hoặc đang gọi endpoint refresh, không retry
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const isAuthPage =
          path.startsWith("/user/login") ||
          path.startsWith("/user/signup") ||
          path.startsWith("/user/forgot-password") ||
          path.startsWith("/user/reset-password");

        const isRefreshEndpoint =
          originalRequest.url?.includes("/auth/refresh");

        if (isAuthPage || isRefreshEndpoint) {
          localStorage.removeItem("auth-storage");
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

      originalRequest._retry = true;
      isRefreshing = true;

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

        // Process queue với token mới
        processQueue(null, newAccessToken);

        // Retry request ban đầu với token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return privateClient(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại, clear auth và redirect
        processQueue(refreshError, null);
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("cart-storage");

        if (typeof window !== "undefined") {
          window.location.replace("/user/login");
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default privateClient;
