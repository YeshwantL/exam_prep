"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      setMessage("⚠️ Supabase is not configured. Please add your credentials to frontend/.env.local");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/";
      }
    } catch (error: any) {
      setMessage(error.message || "An error occurred");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">
          {isSignUp ? "Create Account" : "Login"}
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Exam Prep AI - Authorized Access Only
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn w-full"
            disabled={loading}
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.includes("error") || message.includes("Invalid")
              ? "bg-red-500/10 border border-red-500 text-red-200"
              : "bg-green-500/10 border border-green-500 text-green-200"
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-purple-400 hover:text-purple-300"
          >
            {isSignUp
              ? "Already have an account? Login"
              : "Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
