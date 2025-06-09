"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface AuthContextType {
  accessToken: string | null
  refreshToken: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)

  useEffect(() => {
    // Load tokens from localStorage on mount
    const storedAccessToken = localStorage.getItem("access_token")
    const storedRefreshToken = localStorage.getItem("refresh_token")
    if (storedAccessToken) setAccessToken(storedAccessToken)
    if (storedRefreshToken) setRefreshToken(storedRefreshToken)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch("https://clims.health.go.ug/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier:email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.message || "Invalid credentials")
    }

    const data = await response.json()
    setAccessToken(data.access_token)
    setRefreshToken(data.refresh_token)
    localStorage.setItem("access_token", data.access_token)
    localStorage.setItem("refresh_token", data.refresh_token)
  }

  const logout = () => {
    setAccessToken(null)
    setRefreshToken(null)
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  }

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 