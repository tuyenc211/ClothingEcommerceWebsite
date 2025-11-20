// libs/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import useAuthStore from "@/stores/useAuthStore";

const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8088/api/v1"
    : "/api/v1";

const privateClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // gửi cookie (refreshToken)
  headers: { "Content-Type": "application/json" },
});

/* ---------- Refresh queue ---------- */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

/* ---------- Helpers re: paths ---------- */
const isAuthPagePath = (path: string) => path.startsWith("/login");
const isRefreshUrl = (url?: string) => !!url && url.includes("/auth/refresh");

/* ---------- Request interceptor: attach token from Zustand ---------- */
privateClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      try {
        // ưu tiên dùng getAccessToken nếu bạn đã implement; fallback to direct field
        const token =
          typeof useAuthStore.getState().getAccessToken === "function"
            ? useAuthStore.getState().getAccessToken()
            : useAuthStore.getState().accessToken;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        // Không làm gì nếu truy cập store thất bại (SSR/build)
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------- Response interceptor: handle 401 + refresh ---------- */
privateClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // chỉ xử lý 401 và chưa retry
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // client-side: nếu đang ở trang auth hoặc đang gọi refresh endpoint -> clear token và reject
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (isAuthPagePath(path) || isRefreshUrl(originalRequest.url)) {
        try {
          // chỉ clear token (tránh gọi logout() có thể gọi axios gây loop)
          useAuthStore.getState().setAccessToken(null);
        } catch {}
        return Promise.reject(error);
      }
    }

    // Nếu đang refresh, push vào queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return privateClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const resp = await privateClient.get("/auth/refresh");
      const newToken = (resp.data as any)?.accesstoken || null;

      // cập nhật token vào Zustand (persist middleware sẽ tự lưu)
      try {
        useAuthStore.getState().setAccessToken(newToken);
      } catch {}

      processQueue(null, newToken);

      if (originalRequest.headers && newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return privateClient(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);

      // Clear token trong store (không gọi logout để tránh vòng lặp)
      try {
        useAuthStore.getState().setAccessToken(null);
      } catch {}

      // Xóa dữ liệu liên quan khác nếu muốn
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("cart-storage");
        }
      } catch {}

      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }

      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default privateClient;
