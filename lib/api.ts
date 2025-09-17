const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.codecatalystug.com/api";

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
    // Improved: Try to get specific error message
    let errorMessage = "Failed to refresh token";
    try {
      const errorInfo = await res.json();
      errorMessage = errorInfo.message || errorInfo.error || errorMessage;
    } catch {
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  setTokens(data.access_token, data.refresh_token);
  return data.access_token;
};

// Custom error interface for better TS
interface ApiError extends Error {
  info?: any;
  status?: number;
}

const handleRequest = async (
  path: string,
  options: RequestInit,
  retry = true
): Promise<any> => {
  const res = await fetch(withBaseUrl(path), options);

  if (res.status === 401 && retry) {
    try {
      const newAccessToken = await refreshToken();
      const updatedOptions = {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${newAccessToken}`,
        },
      };
      return handleRequest(path, updatedOptions, false); // Retry once, avoid mutation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Session expired. Please log in again.";
      throw new Error(errorMessage);
    }
  }

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}: An error occurred while fetching the data.`;
    let errorInfo: any = null;
    try {
      errorInfo = await res.json();
      errorMessage = errorInfo.message || errorInfo.error || res.statusText || errorMessage;
    } catch (parseErr) {
      errorMessage = res.statusText || errorMessage;
    }

    const error: ApiError = new Error(errorMessage);
    error.info = errorInfo;
    error.status = res.status;
    throw error;
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res.text(); // Fallback for non-JSON
};

const buildUrlWithQuery = (path: string, queryParams?: Record<string, any>) => {
  if (!queryParams || Object.keys(queryParams).length === 0) return path;
  const queryString = new URLSearchParams(queryParams).toString();
  return `${path}?${queryString}`;
};

export const fetcher = async (path: string, queryParams?: Record<string, any>) => {
  const token = getToken();
  const fullPath = buildUrlWithQuery(path, queryParams);
  return handleRequest(fullPath, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

export const apiClient = {
  get: async <TResponse = any>(path: string, queryParams?: Record<string, any>): Promise<TResponse> => {
    const token = getToken();
    const fullPath = buildUrlWithQuery(path, queryParams);
    return handleRequest(fullPath, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  },

  post: async <TBody extends Record<string, any>, TResponse = any>(
    path: string,
    body: TBody
  ): Promise<TResponse> => {
    const token = getToken();
    return handleRequest(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });
  },

  delete: async <TResponse = any>(path: string): Promise<TResponse> => {
    const token = getToken();
    return handleRequest(path, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  },

  postFormData: async <TResponse = any>(
    path: string,
    formData: FormData
  ): Promise<TResponse> => {
    const token = getToken();
    return handleRequest(path, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Do NOT set Content-Type; browser will set it with boundary
      },
      body: formData,
    });
  },

  putFormData: async <TResponse = any>(
    path: string,
    formData: FormData
  ): Promise<TResponse> => {
    const token = getToken();
    return handleRequest(path, {
      method: "PUT",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Do NOT set Content-Type; browser will set it with boundary
      },
      body: formData,
    });
  },
};