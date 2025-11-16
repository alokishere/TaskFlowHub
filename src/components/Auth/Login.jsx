import React, { useState } from "react";
import { validateLoginForm } from "../../utils/validation";

const Login = ({ handleAuth }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (loginError) {
      setLoginError("");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setLoginError("");

    try {
      const result = await handleAuth(formData.email, formData.password);
      if (result.success) {
        setFormData({ email: "", password: "" });
      } else {
        setLoginError(result.error || "Login failed");
      }
    } catch (error) {
      setLoginError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-emerald-900">
      <div className="bg-gray-800 shadow-xl border border-emerald-700 px-10 py-12 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-emerald-400 mb-8 text-center">
          Login
        </h2>

        {loginError && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-2 rounded-lg mb-6 text-sm">
            {loginError}
          </div>
        )}

        <form onSubmit={submitHandler} className="flex flex-col gap-6">
          <div>
            <input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full py-3 px-5 outline-none border rounded-full focus:ring-2 transition placeholder:text-gray-400 ${
                errors.email
                  ? 'border-red-500 bg-red-500 bg-opacity-10 text-white'
                  : 'border-emerald-700 bg-gray-900 text-white focus:ring-emerald-500'
              }`}
              type="email"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1 ml-5">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full py-3 px-5 outline-none border rounded-full focus:ring-2 transition placeholder:text-gray-400 ${
                errors.password
                  ? 'border-red-500 bg-red-500 bg-opacity-10 text-white'
                  : 'border-emerald-700 bg-gray-900 text-white focus:ring-emerald-500'
              }`}
              type="password"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1 ml-5">{errors.password}</p>
            )}
          </div>

          <button
            className="py-3 px-5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold shadow-md hover:scale-105 transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Log in"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button className="text-emerald-400 hover:text-emerald-300 text-sm transition">
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
