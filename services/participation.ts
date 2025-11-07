import { apiClient } from "@/lib/apiClient";
import type {
  GetParticipationResponse,
  SubmitParticipationPayload,
  SubmitParticipationResponse,
} from "@/types/participation";
import type { ApiListParams } from "@/types/api";

export async function fetchParticipation(
  params: ApiListParams = {}
): Promise<GetParticipationResponse> {
  const response = await apiClient.get<GetParticipationResponse>("/api/participation", { params });
  return response.data;
}

export async function submitParticipation(
  payload: SubmitParticipationPayload
): Promise<SubmitParticipationResponse> {
  const response = await apiClient.post<SubmitParticipationResponse>("/api/participation", payload);
  return response.data;
}


