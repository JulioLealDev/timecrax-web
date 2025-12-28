import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg("Please fill in email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      navigate("/");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-row">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              placeholder="youremail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <div className="login-row">
            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="current-password"
            />
          </div>

          {errorMsg && <div className="login-error">{errorMsg}</div>}

          <button className="login-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>

          <div className="login-links">
            <Link to="/forgot-password" className="login-forgot-link">
              Forgot password?
            </Link>
          </div>

          <div className="login-register">
            <span className="login-register-text">Don't have an account?</span>{" "}
            <Link to="/register" className="login-register-link">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
