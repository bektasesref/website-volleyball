export interface ApiErrorResponse {
  message: string;
  issues?: unknown;
}

export interface ApiListParams {
  limit?: number;
  cycleKey?: string;
}

