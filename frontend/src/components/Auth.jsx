import React, { useState } from "react";
import { API, setToken } from "../services/api.js";

const Auth = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await API.post(`/auth/${mode}`, { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      onLogin(data.user);
    } catch (e) {
      setError(e.response?.data?.message || "Request failed");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">Binary-Trade</div>
        <p className="muted">Binary options UI · virtual funds</p>
        <form onSubmit={submit}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (6+ chars)"
            type="password"
            minLength={6}
            required
          />
          {error && <div className="error">{error}</div>}
          <button className="primary full">
            {mode === "login" ? "Sign in" : "Create demo account"}
          </button>
        </form>
        <button
          className="link-button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Create a demo account"
            : "I already have an account"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
