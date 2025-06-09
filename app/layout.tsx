
"use client"
import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/AuthContext"
import { SWRConfig } from "swr"
import { fetcher } from "@/lib/api"

const inter = Inter({ subsets: ["latin"] })


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        onError: (err) => {
          console.error("SWR error:", err)
        },
      }}
    >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </AuthProvider>
        </SWRConfig>

      </body>
    </html>
  )
}


