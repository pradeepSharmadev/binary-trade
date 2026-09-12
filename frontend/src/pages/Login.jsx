import React, { useState } from "react";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import ErrorMessage from "../components/common/ErrorMessage";

import { API, setToken } from "../services/api.js";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (!form.email) {
      setError("Please enter your email.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    try {
      const { data } = await API.post(`/auth/login`, {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      onLogin(data.user);
      setLoading(false);
    } catch (e) {
      setError(e.response?.data?.message || "Request failed");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen px-4 py-10 font-sans text-[#eef3ff]"
      style={{
        background: "radial-gradient(circle at 50% 0, #172746 0, #080d19 55%)",
      }}
    >
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>

            <p className="mt-2 text-sm text-[#91a0bc]">
              Sign in to continue to your account
            </p>
          </div>

          {/* Card */}
          <div
            className="
              rounded-2xl border border-[#263654]
              bg-[#0c1424]/90 p-6 shadow-2xl
              shadow-black/30 backdrop-blur-xl sm:p-8
            "
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#91a0bc]">
                  <input
                    type="checkbox"
                    className="
                      h-4 w-4 rounded border-[#34445f]
                      bg-[#111c30] text-blue-600
                      focus:ring-blue-500
                    "
                  />
                  <span className="ml-2">Remember me</span>
                </label>

                <a
                  href="#"
                  className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="
                  w-full border border-blue-400/20
                  bg-blue-600 text-white
                  shadow-lg shadow-blue-600/20
                  hover:bg-blue-500
                "
              >
                Sign in
              </Button>
              <ErrorMessage error={error} />
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#263654]" />
              <span className="text-xs text-[#65738c]">OR</span>
              <div className="h-px flex-1 bg-[#263654]" />
            </div>

            <p className="text-center text-sm text-[#91a0bc]">
              Don't have an account?{" "}
              <a
                href="/register"
                className="font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Create account
              </a>
            </p>
          </div>
          <p className="mt-6 text-center text-xs text-[#52617a]">
            © 2026 Binary Trade. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
