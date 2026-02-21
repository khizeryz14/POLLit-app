import { useState } from "react";

export default function Auth() {
  const [mode, setMode] = useState("login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f14] via-[#151521] to-[#0f0f14] flex items-center justify-center px-4">
      
      <div className="w-full max-w-md bg-[#181824]/90 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl p-8 text-white">
        
        {/* Toggle */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-2xl text-sm transition ${
              mode === "login"
                ? "bg-white text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-2xl text-sm transition ${
              mode === "signup"
                ? "bg-white text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {mode === "login"
              ? "Log in to continue voting"
              : "Join POLLit in seconds"}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          <button className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 rounded-xl py-3 text-sm font-medium tracking-wide transition shadow-lg shadow-indigo-500/20">
            {mode === "login" ? "Log In" : "Create Account"}
          </button>
        </div>

        {/* Footer hint */}
        <p className="text-xs text-center text-gray-500 mt-6">
          {mode === "login"
            ? "New to POLLit? Switch to Sign Up"
            : "Already have an account? Switch to Log In"}
        </p>
      </div>
    </div>
  );
}