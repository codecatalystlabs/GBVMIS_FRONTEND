const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://clims.health.go.ug/api";

const withBaseUrl = (path: string) =>
  `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

const getRefreshToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;

const setTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem("access_token", accessToken);
  if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
};

const refreshToken = async () => {
  const refresh_token = getRefreshToken();

  if (!refresh_token) {
    throw new Error("No refresh token available");
  }

  const res = await fetch(withBaseUrl("/refresh-token"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token }),
  });

  if (!res.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await res.json();
  setTokens(data.access_token, data.refresh_token);
  return data.access_token;
};

const handleRequest = async (
  path: string,
  options: RequestInit,
  retry = true
): Promise<any> => {
  const res = await fetch(withBaseUrl(path), options);

  if (res.status === 401 && retry) {
    try {
      const newAccessToken = await refreshToken();
      options.headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${newAccessToken}`,
      };
      return handleRequest(path, options, false); // retry once
    } catch (err) {
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    (error as any).info = await res.json();
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};

export const fetcher = async (path: string) => {
  const token = getToken();
  return handleRequest(path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const apiClient = {
  post: async <TBody extends Record<string, any>, TResponse = any>(
    path: string,
    body: TBody
  ): Promise<TResponse> => {
    const token = getToken();
    return handleRequest(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  },

  put: async <TBody extends Record<string, any>, TResponse = any>(
    path: string,
    body: TBody
  ): Promise<TResponse> => {
    const token = getToken();
    return handleRequest(path, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  },

  delete: async <TResponse = any>(path: string): Promise<TResponse> => {
    const token = getToken();
    return handleRequest(path, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
