import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPasswordPage.css";

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: Implement password reset endpoint call
      // await authService.forgotPassword(email);

      // For now, show success message
      setSuccessMsg(
        "If an account exists with this email, you will receive password reset instructions shortly."
      );
      setEmail("");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1 className="forgot-password-title">Reset Password</h1>
          <p className="forgot-password-subtitle">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="forgot-password-row">
            <label className="forgot-password-label">Email</label>
            <input
              className="forgot-password-input"
              type="email"
              placeholder="youremail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          {errorMsg && <div className="forgot-password-error">{errorMsg}</div>}
          {successMsg && <div className="forgot-password-success">{successMsg}</div>}

          <button
            className="forgot-password-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>

          <button
            type="button"
            className="forgot-password-back"
            onClick={() => navigate("/")}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}
