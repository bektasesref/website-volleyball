import { apiClient } from "@/lib/apiClient";
import type {
  GetMatchDayResponse,
  SubmitMatchDayVotePayload,
  SubmitMatchDayVoteResponse,
} from "@/types/match-day";
import type { ApiListParams } from "@/types/api";

export async function fetchMatchDay(
  params: ApiListParams = {}
): Promise<GetMatchDayResponse> {
  const response = await apiClient.get<GetMatchDayResponse>("/api/match-day", { params });
  return response.data;
}

export async function submitMatchDayVote(
  payload: SubmitMatchDayVotePayload
): Promise<SubmitMatchDayVoteResponse> {
  const response = await apiClient.post<SubmitMatchDayVoteResponse>("/api/match-day", payload);
  return response.data;
}


