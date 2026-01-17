"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      console.log("✅ Sign in successful:", data)
      router.push("/")
      router.refresh()
    } catch (err: any) {
      console.error("❌ Sign in error:", err)
      setError(err.message || "Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      console.log("✅ Sign up successful:", data)
      setMessage("Check your email to confirm your account!")
    } catch (err: any) {
      console.error("❌ Sign up error:", err)
      setError(err.message || "Sign up failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">🚀 LeadScraper AI</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSignIn}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleSignUp}
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Minimum password length: 6 characters
        </p>
      </div>
    </div>
  )
}
