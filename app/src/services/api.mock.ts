/**
 * Axios adapter that serves responses from the offline mock handlers.
 * Installed on the `api` instance when USE_MOCK_API is true.
 * Pure TS — no React Native imports (Node-testable).
 */
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { handleMockRequest } from "../mocks/handlers";

export const mockAxiosAdapter: AxiosAdapter = async (config) => {
  const headers = config.headers as Record<string, string | undefined>;
  const token = headers?.Authorization?.replace("Bearer ", "");

  const result = handleMockRequest({
    method: config.method?.toUpperCase() ?? "GET",
    path: config.url ?? "",
    body: config.data,
    token,
  });

  const response: AxiosResponse = {
    data: result.data,
    status: result.status,
    statusText: result.status >= 400 ? "Mock Error" : "OK",
    headers: {},
    config,
  };

  if (result.status >= 400) {
    const error = new Error(
      ((result.data as { message?: string })?.message ?? "Request failed") as string,
    ) as Error & { response?: AxiosResponse; isAxiosError?: boolean };
    error.response = response;
    error.isAxiosError = true;
    throw error;
  }

  return response;
};

/** Returns true when the given config is routed to the mock adapter. */
export function isMockRequest(config: InternalAxiosRequestConfig): boolean {
  return config.adapter === mockAxiosAdapter || config.adapter?.name === "mockAxiosAdapter";
}
