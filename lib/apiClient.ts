import axios from "axios";
import { ApiError } from "@/lib/http/apiError";
import type { ApiErrorResponse } from "@/types/api";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || undefined;

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const headers = axios.AxiosHeaders.from(config.headers);
  headers.set("X-Requested-With", "XMLHttpRequest");
  config.headers = headers;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const responseData = error.response.data as ApiErrorResponse | undefined;
      const message = responseData?.message ?? "Beklenmeyen bir hata oluştu";

      return Promise.reject(
        new ApiError<ApiErrorResponse>(message, {
          status: error.response.status,
          data: responseData,
        })
      );
    }

    if (error.request) {
      return Promise.reject(
        new ApiError("Sunucuya ulaşılamadı. Lütfen bağlantınızı kontrol edin.")
      );
    }

    return Promise.reject(new ApiError(error.message));
  }
);

