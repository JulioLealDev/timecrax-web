import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { CustomSelect } from "../components/CustomSelect";
import { CustomDatePicker } from "../components/CustomDatePicker";
import { Modal } from "../components/Modal";
import { apiRequest } from "../services/api";
import { translateError } from "../utils/translateError";
import "./RegisterPage.css";

type Role = "student" | "teacher" | "player";

const MINIMUM_AGE = 6;

function calculateAge(birthDate: Date | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t, i18n } = useTranslation();

  // Birth date (first step)
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [role, setRole] = useState<Role>("player");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [agreeGdpr, setAgreeGdpr] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);
  const [showGdprModal, setShowGdprModal] = useState(false);
  const [gdprText, setGdprText] = useState<string | null>(null);
  const [gdprLoading, setGdprLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function getGdprLanguage(): string {
    const lang = i18n.language;
    if (lang.startsWith("pt-BR") || lang === "pt") return "pt-br";
    if (lang.startsWith("pt-PT")) return "pt-pt";
    if (lang.startsWith("fr")) return "fr";
    if (lang.startsWith("es")) return "es";
    return "en";
  }

  async function fetchGdprText() {
    setGdprLoading(true);
    try {
      const language = getGdprLanguage();
      const response = await apiRequest<{ terms: string; version: number }>(`/legal/gdpr/${language}`);
      setGdprText(response.terms);
    } catch {
      setGdprText(t("register.gdprLoadError"));
    } finally {
      setGdprLoading(false);
    }
  }

  function handleOpenGdprModal(e: React.MouseEvent) {
    e.preventDefault();
    setShowGdprModal(true);
    // Always fetch to ensure correct language
    fetchGdprText();
  }

  function handleBirthDateChange(date: Date | null) {
    setBirthDate(date);
    const calculatedAge = calculateAge(date);
    setAge(calculatedAge);
  }

  function handleContinue() {
    setErrorMsg(null);

    if (!birthDate) {
      setErrorMsg(t("register.errorBirthDateRequired"));
      return;
    }

    const calculatedAge = calculateAge(birthDate);
    if (calculatedAge === null || calculatedAge < MINIMUM_AGE) {
      setErrorMsg(t("register.errorMinimumAge", { age: MINIMUM_AGE }));
      return;
    }

    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setErrorMsg(t("register.errorFillFields"));
      return;
    }
    if (password.length < 6) {
      setErrorMsg(t("register.errorPasswordLength"));
      return;
    }
    if (password !== password2) {
      setErrorMsg(t("register.errorPasswordMatch"));
      return;
    }
    if (!agreeGdpr) {
      setErrorMsg(t("register.errorAgreeGdpr"));
      return;
    }
    if (age !== null && age < 16 && !parentalConsent) {
      setErrorMsg(t("register.errorParentalConsentRequired"));
      return;
    }

    try {
      setIsSubmitting(true);
      const language = getGdprLanguage();
      await register(firstName.trim(), lastName.trim(), email.trim(), password, schoolName.trim(), role, language);
      navigate("/profile");
    } catch (err) {
      setErrorMsg(translateError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">{t("register.title")}</h1>
          <p className="register-subtitle">
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Step 1: Birth Date */}
          <div className="register-row">
            <label className="register-label">{t("register.birthDate")}</label>
            <CustomDatePicker
              value={birthDate}
              onChange={handleBirthDateChange}
              maxDate={new Date()}
              disabled={isSubmitting || showForm}
              placeholder={t("register.birthDatePlaceholder")}
            />
          </div>

          {!showForm && errorMsg && <div className="register-error">{errorMsg}</div>}

          {!showForm && (
            <button
              type="button"
              className="register-button"
              onClick={handleContinue}
              disabled={!birthDate}
            >
              {t("register.continueToForm")}
            </button>
          )}

          {/* Step 2: Rest of the form (revealed after birth date) */}
          {showForm && (
            <div className="register-form-fields">
              <div className="register-row">
                <label className="register-label">{t("register.firstName")}</label>
                <input
                  className="register-input"
                  placeholder={t("register.firstName")}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="given-name"
                />
              </div>

              <div className="register-row">
                <label className="register-label">{t("register.lastName")}</label>
                <input
                  className="register-input"
                  placeholder={t("register.lastName")}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="family-name"
                />
              </div>

              <div className="register-row">
                <label className="register-label">{t("register.role")}</label>
                <CustomSelect
                  value={role}
                  onChange={(value) => setRole(value as Role)}
                  disabled={isSubmitting}
                  options={[
                    { value: "player", label: t("register.rolePlayer") },
                    { value: "student", label: t("register.roleStudent") },
                    { value: "teacher", label: t("register.roleTeacher") },
                  ]}
                />
              </div>

              {(role === "student" || role === "teacher") && (
                <div className="register-row">
                  <label className="register-label">
                    {t("register.school")}
                    <span className="register-label-note">{t("register.schoolPrivacyNote")}</span>
                  </label>
                  <input
                    className="register-input"
                    placeholder={t("register.schoolPlaceholder")}
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="register-row">
                <label className="register-label">{t("register.email")}</label>
                <input
                  className="register-input"
                  placeholder={t("register.emailPlaceholder")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>

              <div className="register-row">
                <label className="register-label">{t("register.password")}</label>
                <input
                  className="register-input"
                  placeholder={t("register.passwordPlaceholder")}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </div>

              <div className="register-row">
                <label className="register-label">{t("register.confirmPassword")}</label>
                <input
                  className="register-input"
                  placeholder={t("register.confirmPasswordPlaceholder")}
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </div>

              {/* Parental consent for users under 16 */}
              {age !== null && age < 16 && (
                <div className="register-consent-row">
                  <label className="register-consent-label">
                    <input
                      type="checkbox"
                      className="register-consent-checkbox"
                      checked={parentalConsent}
                      onChange={(e) => setParentalConsent(e.target.checked)}
                      disabled={isSubmitting}
                    />
                    <span>{t("register.parentalConsent")}</span>
                  </label>
                </div>
              )}

              <div className="register-gdpr-row">
                <label className="register-gdpr-label">
                  <input
                    type="checkbox"
                    className="register-gdpr-checkbox"
                    checked={agreeGdpr}
                    onChange={(e) => setAgreeGdpr(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <span>
                    {t("register.agreeGdpr")}{" "}
                    <a
                      href="#"
                      className="register-gdpr-link"
                      onClick={handleOpenGdprModal}
                    >
                      {t("register.gdprTerms")}
                    </a>
                  </span>
                </label>
              </div>

              {errorMsg && <div className="register-error">{errorMsg}</div>}

              <button className="register-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("register.creating") : t("register.createAccount")}
              </button>
            </div>
          )}
        </form>
      </div>

      <Modal
        isOpen={showGdprModal}
        onClose={() => setShowGdprModal(false)}
        title={t("register.gdprTerms")}
        maxWidth="600px"
      >
        <div className="gdpr-modal-body">
          {gdprLoading ? (
            <p className="gdpr-modal-loading">{t("common.loading")}</p>
          ) : (
            <p>{gdprText}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
