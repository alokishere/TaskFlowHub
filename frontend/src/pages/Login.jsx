import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { Mail, Lock, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      if (data.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/employee/attendance");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
            <img
              className="h-full w-full object-cover hover:scale-105 transition-transform rounded-2xl"
              src="/logo.png"
              alt="logo"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sarathi India Pvt. Ltd. — EMS</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none"
                placeholder="admin@sarathi.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
