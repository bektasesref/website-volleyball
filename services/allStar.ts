import { apiClient } from "@/lib/apiClient";
import type {
  GetAllStarResponse,
  SubmitAllStarBallotPayload,
  SubmitAllStarBallotResponse,
} from "@/types/all-star";
import type { ApiListParams } from "@/types/api";

export async function fetchAllStar(params: ApiListParams = {}): Promise<GetAllStarResponse> {
  const response = await apiClient.get<GetAllStarResponse>("/api/all-star", { params });
  return response.data;
}

export async function submitAllStarBallot(
  payload: SubmitAllStarBallotPayload
): Promise<SubmitAllStarBallotResponse> {
  const response = await apiClient.post<SubmitAllStarBallotResponse>("/api/all-star", payload);
  return response.data;
}

