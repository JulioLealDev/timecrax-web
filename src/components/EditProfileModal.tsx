import { FormEvent } from "react";
import "./EditProfileModal.css";

interface EditProfileModalProps {
  isOpen: boolean;
  firstName: string;
  lastName: string;
  schoolName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSchoolNameChange: (value: string) => void;
  onSave: (e: FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
  error?: string | null;
}

export function EditProfileModal({
  isOpen,
  firstName,
  lastName,
  schoolName,
  onFirstNameChange,
  onLastNameChange,
  onSchoolNameChange,
  onSave,
  onCancel,
  isSaving,
  error,
}: EditProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="edit-profile-modal-overlay" onClick={onCancel}>
      <div
        className="edit-profile-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="edit-profile-modal-title">Editar Perfil</h3>

        <form onSubmit={onSave} className="edit-profile-form">
          <div className="edit-profile-row">
            <label className="edit-profile-label">Primeiro nome</label>
            <input
              className="edit-profile-input"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="edit-profile-row">
            <label className="edit-profile-label">Sobrenome</label>
            <input
              className="edit-profile-input"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="edit-profile-row">
            <label className="edit-profile-label">Escola</label>
            <input
              className="edit-profile-input"
              value={schoolName}
              onChange={(e) => onSchoolNameChange(e.target.value)}
              disabled={isSaving}
            />
          </div>

          {error && <div className="edit-profile-error">{error}</div>}

          <div className="edit-profile-modal-actions">
            <button
              type="button"
              className="edit-profile-modal-btn cancel-btn"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="edit-profile-modal-btn save-btn"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
