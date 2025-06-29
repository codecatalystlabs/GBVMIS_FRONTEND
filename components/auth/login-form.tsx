"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
// import { toast } from "@/hooks/use-toast"
import { toast } from "react-toastify"
import { useAuth } from "@/context/AuthContext" // AuthContext for authentication state management

// This component uses AuthContext for authentication

const formSchema = z.object({
  email: z.string().min(2),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth() 
  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

//   async function onSubmit(values: z.infer<typeof formSchema>) {
//   setIsLoading(true)

//   try {
//     const res = await login(values.email, values.password)
//     console.log("Login response:", res)

//     toast({
//       title: "Login Successful",
//       description: "You are being redirected to your dashboard...",
//       variant: "default",
//       duration: 2000, // Optional: makes it more visible
//     })

//     // Delay to allow toast to display before redirect
//     await new Promise((resolve) => setTimeout(resolve, 200))

//     router.push("/dashboard")
//   } catch (error: any) {
//     console.error("Login failed:", error)

//     toast({
//       title: "Login failed",
//       description: error?.message || "Invalid credentials. Please try again.",
//       variant: "destructive",
//     })
//   } finally {
//     setIsLoading(false)
//   }
// }

async function onSubmit(values: z.infer<typeof formSchema>) {
  setIsLoading(true)

  try {
    const res = await login(values.email, values.password)
    console.log("Login successful", res)

    // Show toast notification
    toast.success("🦄 Login Successful! Redirecting to dashboard...", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      // transition: Bounce,
    })


    router.push("/dashboard")
  } catch (error: any) {
    console.error("Login failed:", error)

    toast.error("Login failed: " + (error?.message || "Invalid credentials."), {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      // transition: Bounce,
    })
  } finally {
    setIsLoading(false)
  }
}




  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </Form>
  )
}