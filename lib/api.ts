const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://clims.health.go.ug/api"

const withBaseUrl = (path: string) => `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token")
  }
  return null
}

export const fetcher = async (path: string) => {
  const token = getToken()
  console.log(token,"am token ")
  const res = await fetch(withBaseUrl(path), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    ;(error as any).info = await res.json()
    ;(error as any).status = res.status
    throw error
  }

  return res.json()
}

export const apiClient = {
  post: async <TBody extends Record<string, any>, TResponse = any>(
    path: string,
    body: TBody
  ): Promise<TResponse> => {
    const token = getToken()
    const res = await fetch(withBaseUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    return res.json()
  },

  put: async <TBody extends Record<string, any>, TResponse = any>(
    path: string,
    body: TBody
  ): Promise<TResponse> => {
    const token = getToken()
    const res = await fetch(withBaseUrl(path), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    return res.json()
  },

  delete: async <TResponse = any>(path: string): Promise<TResponse> => {
    const token = getToken()
    const res = await fetch(withBaseUrl(path), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.json()
  },
}
