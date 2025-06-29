"use client"

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
    const info = await res.json().catch(() => ({})); // Handle JSON parse errors
    const error = new Error("An error occurred while fetching the data.");
    (error as any).info = info;
    (error as any).status = res.status;
    console.error(`Request failed with status ${res.status}:`, info);
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

  postFormData: async <TResponse = any>(
    path: string,
    formData: FormData
  ): Promise<TResponse> => {
    const token = getToken();
    return handleRequest(path, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type; browser will set it with boundary
      },
      body: formData,
    });
  },

  // Create a new case record
  createCase: async <TBody extends Record<string, any>, TResponse = any>(
    body: TBody
  ): Promise<TResponse> => {
    const token = getToken();
    return handleRequest("/case", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  },

  // Retrieve a single case record by ID
  getCaseById: async <TResponse = any>(id: number | string): Promise<TResponse> => {
    const token = getToken();
    return handleRequest(`/case/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Update an existing case record by ID
  updateCase: async <TBody extends Record<string, any>, TResponse = any>(
    id: number | string,
    body: TBody
  ): Promise<TResponse> => {
    const token = getToken();
    return handleRequest(`/case/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  },

  // Delete a case record by ID
  deleteCase: async <TResponse = any>(id: number | string): Promise<TResponse> => {
    const token = getToken();
    return handleRequest(`/case/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Retrieve a paginated list of cases
  getCases: async <TResponse = any>(
    params: { page?: number; pageSize?: number } = {}
  ): Promise<TResponse> => {
    const token = getToken();
    const query = new URLSearchParams({
      page: params.page?.toString() || "1",
      pageSize: params.pageSize?.toString() || "10",
    }).toString();
    return handleRequest(`/cases?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Search for cases with pagination
  searchCases: async <TResponse = any>(
    params: { search?: string; page?: number; pageSize?: number } = {}
  ): Promise<TResponse> => {
    const token = getToken();
    const query = new URLSearchParams({
      search: params.search || "",
      page: params.page?.toString() || "1",
      pageSize: params.pageSize?.toString() || "10",
    }).toString();
    return handleRequest(`/cases/search?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
};