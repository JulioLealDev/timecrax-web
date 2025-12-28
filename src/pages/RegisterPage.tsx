import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CustomSelect } from "../components/CustomSelect";
import "./RegisterPage.css";

type Role = "student" | "teacher" | "player";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [role, setRole] = useState<Role>("player");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== password2) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await register(firstName.trim(), lastName.trim(), email.trim(), password, schoolName.trim(), role);
      navigate("/");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Register</h1>
          <p className="register-subtitle">
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-row">
            <label className="register-label">First Name</label>
            <input
              className="register-input"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isSubmitting}
              autoComplete="name"
            />
          </div>

          <div className="register-row">
            <label className="register-label">Last Name</label>
            <input
              className="register-input"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isSubmitting}
              autoComplete="name"
            />
          </div>

          <div className="register-row">
            <label className="register-label">Role</label>
            <CustomSelect
              value={role}
              onChange={(value) => setRole(value as Role)}
              disabled={isSubmitting}
              options={[
                { value: "player", label: "I'm just a player" },
                { value: "student", label: "I'm a student" },
                { value: "teacher", label: "I'm a teacher" },
              ]}
            />
          </div>

          {(role === "student" || role === "teacher") && (
            <div className="register-row">
              <label className="register-label">School</label>
              <input
                className="register-input"
                placeholder="School Name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="register-row">
            <label className="register-label">Email</label>
            <input
              className="register-input"
              placeholder="youremail@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <div className="register-row">
            <label className="register-label">Password</label>
            <input
              className="register-input"
              placeholder="Create a password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          <div className="register-row">
            <label className="register-label">Confirm Password</label>
            <input
              className="register-input"
              placeholder="Repeat password"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          {errorMsg && <div className="register-error">{errorMsg}</div>}

          <button className="register-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
