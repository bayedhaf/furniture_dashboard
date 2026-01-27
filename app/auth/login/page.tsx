"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const route = useRouter()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormValues) {
    const res = await signIn("credentials", {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      redirect: false,
    })

    if (res?.error) {
      setError("root", {
        type: "credentials",
        message: "Invalid email or password",
      })
      return
    }

    const session = await getSession()
    const role = (session as { role?: string })?.role

    if (role === "admin" || role === "ADMIN") {
      route.push("/admin")
    } else if (role === "manager" || role === "MANAGER") {
      route.push("/manager/dashboard")
    } else {
      route.push("/")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-4">
      <Card className="w-full max-w-sm border-[#E1E4E8]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-[#1B3A57]">
            Sign in
          </CardTitle>
          <CardDescription className="text-[#6C757D]">
            Enter your email and password to access the dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-[#333333]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@company.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-[#DC3545]">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-[#333333]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-[#DC3545]">
                  {errors.password.message}
                </p>
              )}
            </div>

            {errors.root && (
              <Alert className="border-[#DC3545] text-[#DC3545]">
                <AlertDescription>
                  {errors.root.message}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-[#007B7F] hover:bg-[#00686C] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
