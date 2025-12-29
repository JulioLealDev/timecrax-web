import { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import "./EditProfileModal.css";

interface EditProfileModalProps {
  isOpen: boolean;
  firstName: string;
  lastName: string;
  schoolName: string;
  showSchool?: boolean;
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
  showSchool = true,
  onFirstNameChange,
  onLastNameChange,
  onSchoolNameChange,
  onSave,
  onCancel,
  isSaving,
  error,
}: EditProfileModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={t("editProfileModal.title")}
      maxWidth="500px"
    >
      <form onSubmit={onSave} className="edit-profile-form">
        <div className="edit-profile-row">
          <label className="edit-profile-label">{t("editProfileModal.firstName")}</label>
          <input
            className="edit-profile-input"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="edit-profile-row">
          <label className="edit-profile-label">{t("editProfileModal.lastName")}</label>
          <input
            className="edit-profile-input"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            disabled={isSaving}
          />
        </div>

        {showSchool && (
          <div className="edit-profile-row">
            <label className="edit-profile-label">{t("editProfileModal.school")}</label>
            <input
              className="edit-profile-input"
              value={schoolName}
              onChange={(e) => onSchoolNameChange(e.target.value)}
              disabled={isSaving}
            />
          </div>
        )}

        {error && <div className="edit-profile-error">{error}</div>}

        <div className="edit-profile-modal-actions">
          <button
            type="button"
            className="edit-profile-modal-btn cancel-btn"
            onClick={onCancel}
            disabled={isSaving}
          >
            {t("editProfileModal.cancel")}
          </button>
          <button
            type="submit"
            className="edit-profile-modal-btn save-btn"
            disabled={isSaving}
          >
            {isSaving ? t("editProfileModal.saving") : t("editProfileModal.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
