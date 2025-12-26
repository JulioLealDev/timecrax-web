import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./RegisterPage.css";

type Role = "student" | "teacher";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [role, setRole] = useState<Role>("student");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!firstName.trim() || !lastName.trim() || !schoolName.trim() || !email.trim() || !password) {
      setErrorMsg("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== password2) {
      setErrorMsg("As senhas não conferem.");
      return;
    }

    try {
      setIsSubmitting(true);
      await register(firstName.trim(), lastName.trim(), email.trim(), password, schoolName.trim(), role);
      navigate("/");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Falha no registro.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Registro</h1>
          <p className="register-subtitle">
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-row">
            <label className="register-label">Nome</label>
            <input
              className="register-input"
              placeholder="Primeiro Nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isSubmitting}
              autoComplete="name"
            />
          </div>

          <div className="register-row">
            <label className="register-label">Sobrenome</label>
            <input
              className="register-input"
              placeholder="Ultimo Nome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isSubmitting}
              autoComplete="name"
            />
          </div>

          <div className="register-row">
            <label className="register-label">Escola</label>
            <input
              className="register-input"
              placeholder="Nome da escola"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="register-row">
            <label className="register-label">Função</label>
            <select
              className="register-select"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={isSubmitting}
            >
              <option value="student">Sou aluno(a)</option>
              <option value="teacher">Sou professor(a)</option>
            </select>
          </div>

          <div className="register-row">
            <label className="register-label">Email</label>
            <input
              className="register-input"
              placeholder="seuemail@exemplo.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <div className="register-row">
            <label className="register-label">Senha</label>
            <input
              className="register-input"
              placeholder="Crie uma senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          <div className="register-row">
            <label className="register-label">Confirmar senha</label>
            <input
              className="register-input"
              placeholder="Repita a senha"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          {errorMsg && <div className="register-error">{errorMsg}</div>}

          <button className="register-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando..." : "Criar conta"}
          </button>

          <div className="register-footer">
            <span>Já tem conta?</span>
            <Link to="/" className="register-link">
              Voltar e fazer login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
