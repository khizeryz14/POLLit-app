import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { validateEmail, validateUsername } from "../utils/validators";

export default function Auth() {
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(""); // backend/general error
  const [errors, setErrors] = useState({}); // field-level errors

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* =========================
     Validation (Signup only)
  ========================== */

  const validateForm = () => {
    const newErrors = {};

    if (!validateUsername(username)) {
      newErrors.username =
        "Username must be 3–20 chars (letters, numbers, _)";
    }

    if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
    }

    if (password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* Check for Enter */

  const handleKeyPress = (e) => {
    if(e.key === "Enter"){
      if(loading || (mode === "signup" && !isSignupValid)) return;
      e.preventDefault();
      handleSubmit();
      return;
    }
  }

  /* =========================
     Submit
  ========================== */

  const handleSubmit = async () => {
    if (!email || !password || (mode === "signup" && !username)) return;

    // Frontend validation (signup only)
    if (mode === "signup" && !validateForm()) return;

    try {
      setLoading(true);
      setError("");

      if (mode === "login") {
        await login(email, password);
      } else {
        await register(username, email, password);
      }

      navigate(location.state?.from || "/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Derived
  ========================== */

  const isSignupValid =
    validateEmail(email) &&
    validateUsername(username) &&
    password.length >= 6;

  /* =========================
     UI
  ========================== */

  return (
    <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-md bg-[#181824]/90 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl p-8 text-white">

        {/* Toggle */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
          <button
            onClick={() => {
              setMode("login");
              setErrors({});
              setError("");
            }}
            className={`flex-1 py-2 rounded-2xl text-sm transition ${
              mode === "login"
                ? "bg-white text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Log In
          </button>

          <button
            onClick={() => {
              setMode("signup");
              setErrors({});
              setError("");
            }}
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

        {/* Backend Error */}
        {error && (
          <p className="text-red-400 text-sm text-center mb-4">
            {error}
          </p>
        )}

        {/* Form */}
        <div className="space-y-4" onKeyDown={handleKeyPress}>

          {/* Username */}
          {mode === "signup" && (
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors(prev => ({ ...prev, username: "" }));
                }}
                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {errors.username && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.username}
                </p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors(prev => ({ ...prev, email: "" }));
              }}
              className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors(prev => ({ ...prev, password: "" }));
              }}
              className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full mt-2 rounded-xl py-3 text-sm font-medium transition active:scale-95
              ${
                loading ||
                (mode === "signup" && !isSignupValid)
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90"
              }`}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Log In"
              : "Create Account"}
          </button>

        </div>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 mt-6">
          {mode === "login"
            ? "New to POLLit? Switch to Sign Up"
            : "Already have an account? Switch to Log In"}
        </p>

      </div>
    </div>
  );
}