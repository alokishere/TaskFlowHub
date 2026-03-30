import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Globe, Users, Building2 } from "lucide-react";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const onSubmit = (data) => {
    setIsLoading(true);
    setError(null);
    api
      .post("auth/login", data)
      .then((response) => {
        localStorage.setItem("token", JSON.stringify(response.data.data.token));
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        navigate("/");
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setError("Invalid email or password");
        } else {
          setError("Something went wrong. Try again.");
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "#0a0a0a" }}
    >
      {/* Brand ambient glow */}
      <div
        className="fixed inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 40%)",
        }}
      />

      <div
        className="w-full max-w-5xl flex rounded-2xl overflow-hidden shadow-2xl relative z-10"
        style={{ border: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* LEFT SIDE */}
        <div
          className="w-1/2 p-12 flex flex-col justify-between relative overflow-hidden"
          style={{ background: "#111111" }}
        >
          {/* Glow blobs */}
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }}
          />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="23" cy="23" r="23" fill="#1c1c1c" />
              <text x="9" y="32" fontFamily="Georgia, serif" fontSize="28" fontWeight="bold" fill="#7c3aed">S</text>
              <path d="M30 15 L38 15 L38 23" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M30 23 L38 15" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <div>
              <p className="text-white font-bold text-lg leading-none tracking-[0.25em]">SARATHI</p>
              <p className="text-white/30 text-[9px] tracking-[0.4em] uppercase mt-0.5">India</p>
            </div>
          </div>

          {/* Main content */}
          <div className="relative z-10 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                Navigate
                <br />
                <span style={{ color: "#7c3aed" }}>Global</span>
                <br />
                Opportunities
              </h1>
              <p className="text-white/35 text-sm leading-relaxed max-w-xs">
                Comprehensive service solutions for visa, legal, training, and business support.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: Globe, text: "Visa & Immigration" },
                { icon: Users, text: "Manpower Supply" },
                { icon: Building2, text: "Legal Advisory" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 w-fit"
                  style={{
                    background: "rgba(124,58,237,0.08)",
                    border: "1px solid rgba(124,58,237,0.18)",
                  }}
                >
                  <Icon size={13} style={{ color: "#a78bfa" }} />
                  <span className="text-white/55 text-xs font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div
            className="relative z-10 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-white/20 text-xs">
              Your trusted partner in navigating global opportunities.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="w-1/2 p-12 flex flex-col justify-center"
          style={{ background: "#0d0d0d" }}
        >
          <div className="mb-10">
            <p
              className="text-xs font-semibold tracking-[0.25em] uppercase mb-2"
              style={{ color: "#f59e0b" }}
            >
              Welcome back
            </p>
            <h2 className="text-3xl font-bold text-white">Sign in</h2>
            <p className="text-white/25 text-sm mt-1">to your Sarathi India account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-white/35 text-xs font-medium tracking-[0.2em] uppercase">
                Email Address
              </label>
              <input
                {...register("email", { required: true })}
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl text-white text-sm focus:outline-none transition-all"
                style={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "white",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-white/35 text-xs font-medium tracking-[0.2em] uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password", { required: true })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-white text-sm focus:outline-none transition-all"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "white",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 transition-colors"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 rounded-lg px-4 py-3"
                style={{
                  background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.18)",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 group transition-all mt-2"
              style={{
                background: isLoading
                  ? "#3b1f8c"
                  : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                boxShadow: isLoading ? "none" : "0 4px 28px rgba(124,58,237,0.4)",
                opacity: isLoading ? 0.75 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Forgot / Create Account */}
          <div className="mt-6 flex items-center justify-between">
            <button
              className="text-xs transition-colors"
              style={{ color: "rgba(255,255,255,0.28)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </button>
            <button
              className="text-xs transition-colors"
              style={{ color: "rgba(255,255,255,0.28)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
              onClick={() => navigate("/register")}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;