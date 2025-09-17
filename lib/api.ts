const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.codecatalystug.com/api";

const withBaseUrl = (path: string): string =>
  `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const getToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

const getRefreshToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;

const setTokens = (accessToken: string, refreshToken?: string): void => {
  localStorage.setItem("access_token", accessToken);
  if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
};

const refreshToken = async (): Promise<string> => {
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

// Custom error interface
interface ApiError extends Error {
  info?: any;
  status?: number;
}

const handleRequest = async <T>(
  path: string,
  options: RequestInit,
  retry = true
): Promise<T> => {
  const res = await fetch(withBaseUrl(path), options);

  if (res.status === 401 && retry) {
    try {
      const newAccessToken = await refreshToken();
      const updatedOptions: RequestInit = {
        ...options,
        headers: {
          ...((options.headers as Record<string, string>) || {}),
          Authorization: `Bearer ${newAccessToken}`,
        },
      };
      return handleRequest<T>(path, updatedOptions, false); // Retry once
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
    return res.json() as Promise<T>;
  }
  return res.text() as Promise<T>; // Fallback for non-JSON, typed as T
};

const buildUrlWithQuery = (path: string, queryParams?: Record<string, any>): string => {
  if (!queryParams || Object.keys(queryParams).length === 0) return path;
  const queryString = new URLSearchParams(
    Object.entries(queryParams).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value.toString();
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  return `${path}?${queryString}`;
};

export const fetcher = async <T>(
  path: string,
  queryParams?: Record<string, any>
): Promise<T> => {
  const token = getToken();
  const fullPath = buildUrlWithQuery(path, queryParams);
  return handleRequest<T>(fullPath, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

export const apiClient = {
  get: async <TResponse = any>(
    path: string,
    queryParams?: Record<string, any>
  ): Promise<TResponse> => {
    const token = getToken();
    const fullPath = buildUrlWithQuery(path, queryParams);
    return handleRequest<TResponse>(fullPath, {
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
    return handleRequest<TResponse>(path, {
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
    return handleRequest<TResponse>(path, {
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
    return handleRequest<TResponse>(path, {
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
    return handleRequest<TResponse>(path, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }), 
      },
      body: formData,
    });
  },

  putFormData: async <TResponse = any>(
    path: string,
    formData: FormData
  ): Promise<TResponse> => {
    const token = getToken();
    return handleRequest<TResponse>(path, {
      method: "PUT",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }), 
      },
      body: formData,
    });
  },
};