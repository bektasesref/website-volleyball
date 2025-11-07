import { apiClient } from "@/lib/apiClient";
import type {
  CreateDrawPayload,
  CreateDrawResponse,
  GetDrawsResponse,
} from "@/types/draw";
import type { ApiListParams } from "@/types/api";

export async function fetchDraws(params: ApiListParams = {}): Promise<GetDrawsResponse> {
  const response = await apiClient.get<GetDrawsResponse>("/api/draws", { params });
  return response.data;
}

export async function createDraw(payload: CreateDrawPayload): Promise<CreateDrawResponse> {
  const response = await apiClient.post<CreateDrawResponse>("/api/draws", payload);
  return response.data;
}

