import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  message?: string;
}

export function LoadingSpinner({ size = "medium", message }: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner-container ${size}`} role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      {message && <span className="loading-message">{message}</span>}
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}
