import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { meService } from "../services/me.service";
import { useAuth } from "../context/AuthContext";
import imageTemplate from "../assets/imageTemplate.png";
import "./ProfilePage.css";

type EditableProfile = {
  firstName: string;
  lastName: string;
  schoolName: string;
};

export function ProfilePage() {
  const { user, refreshMe } = useAuth();
  const [ isEditingProfile, setIsEditingProfile] = useState(false);
  const [ profileError, setProfileError] = useState<string | null>(null);
  const [pictureVersion, setPictureVersion] = useState(() => Date.now());

  // Upload de imagem (por enquanto só UI)
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<EditableProfile>({
    firstName: "",
    lastName: "",
    schoolName: "",
  });

  const displayName = useMemo(() => {
    const fn = user?.firstName?.trim() ?? "";
    const ln = user?.lastName?.trim() ?? "";
    const full = `${fn} ${ln}`.trim();
    return full || user?.email || "";
  }, [user]);

  useEffect(() => {
  if (user?.picture) setPictureVersion(Date.now());
}, [user?.picture]);

  useEffect(() => {
    if (!user) return;

    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      schoolName: user.schoolName ?? "",
    });
  }, [user]);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const isStudent = user.role === "student";
  const isTeacher = user.role === "teacher";

  function handleChange(field: keyof EditableProfile, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openImagePicker() {
    fileInputRef.current?.click();
  }

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    try {
      setIsUploading(true);

      console.log("Imagem selecionada:", file.name);

      // 1) envia a imagem
      const result = await meService.uploadPicture(file);
      console.log("Upload OK:", result);

      // 2) recarrega /me para atualizar user.picture
      await refreshMe();
      setPictureVersion(Date.now());
      
    } catch (err: any) {
      console.error("Erro no upload:", err);
      setUploadError(err?.message ?? "Erro ao enviar imagem.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);

    if (!form.firstName.trim()) {
      setProfileError("O primeiro nome é obrigatório.");
      return;
    }

    try {
      setIsSavingProfile(true);

      // Envia somente o que você quer permitir alterar
      await meService.updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        schoolName: form.schoolName.trim(),
      });

      // Recarrega /me e atualiza a navbar/profile
      await refreshMe();

      setIsEditingProfile(false);
    } catch (err: any) {
      setProfileError(err?.message ?? "Erro ao salvar alterações.");
    } finally {
      setIsSavingProfile(false);
    }
  }


  function handleCancelProfile() {
    setForm({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      schoolName: user?.schoolName ?? "",
    });
    setIsEditingProfile(false);
    setProfileError(null);
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* =========================
            STUDENT VIEW
           ========================= */}
        {isStudent && (
          <>
            <div className="profile-header-new">
              <div className="profile-left">
                <div className="avatar-wrap" onClick={openImagePicker} role="button" tabIndex={0}>
                  {/* imagem */}
                  {user.picture ? (
                    <img className="avatar-img" src={`${user.picture}?v=${pictureVersion}`} alt="Foto do perfil" />
                  ) : (
                    <div className="avatar-fallback" aria-label="Sem foto">
                      <span className="avatar-initials">
                        {(user.firstName?.[0] ?? "U").toUpperCase()}
                        {(user.lastName?.[0] ?? "").toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* overlay hover */}
                  <div className="avatar-overlay">
                    <span className="avatar-overlay-text">Editar imagem</span>
                  </div>

                  {/* input file escondido */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="avatar-file"
                    onChange={handleImageSelected}
                  />

                  {isUploading && <div className="profile-hint">Enviando imagem...</div>}
                  {uploadError && <div className="profile-error">{uploadError}</div>}
                </div>

                <div className="profile-info">
                  <div className="profile-name-row">
                    <h1 className="profile-name" data-tooltip={displayName}>
                      {displayName}
                    </h1>
                    <button
                      type="button"
                      className="icon-edit"
                      onClick={() => setIsEditingProfile(true)}
                      aria-label="Editar informações do perfil"
                      data-tooltip="Editar perfil"
                    >
                      ✎
                    </button>
                  </div>
                  <p className="profile-role">Estudante</p>
                  <p className="profile-school" data-tooltip={user.schoolName ?? ""}>
                    {user.schoolName || "Escola não informada"}
                  </p>
                </div>
              </div>

              <div className="profile-right">
                {user.currentMedal && (
                  <div className="profile-medal" data-tooltip={user.currentMedal.name}>
                    <img
                      src={user.currentMedal.image}
                      alt={user.currentMedal.name}
                      className="profile-medal-image"
                    />
                  </div>
                )}
                <div className="profile-score-container">
                  <p className="profile-score-label">Score:</p>
                  <p className="profile-score-value">{user.score ?? 0}</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {user.achievements && user.achievements.length > 0 && (
              <div className="achievements-section">
                <h2 className="achievements-title">Achievements</h2>
                <div className="achievements-grid">
                  {user.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`achievement-item ${achievement.unlockedAt ? 'unlocked' : 'locked'}`}
                      data-tooltip={`${achievement.name}
${achievement.description}
${achievement.unlockedAt ? `Conquistado em: ${new Date(achievement.unlockedAt).toLocaleDateString()}` : 'Bloqueado'}`}
                    >
                      <img
                        src={achievement.image}
                        alt={achievement.name}
                        className="achievement-image"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Themes */}
            <div className="completed-themes-section">
              <h2 className="completed-themes-title">Completed Themes</h2>
              <div className="completed-themes-grid">
                {(() => {
                  const completedCount = user.completedThemes?.length ?? 0;
                  const itemsPerRow = 8;
                  const minRows = 1;
                  const minItems = itemsPerRow * minRows; // 8

                  // Calcula quantas rows são necessárias para que o número de items seja maior que completedCount
                  const requiredRows = Math.ceil((completedCount + 1) / itemsPerRow);
                  const totalRows = Math.max(minRows, requiredRows);
                  const totalItems = totalRows * itemsPerRow;

                  return Array.from({ length: totalItems }).map((_, index) => {
                    const completedTheme = user.completedThemes?.[index];
                    return (
                      <div
                        key={index}
                        className={`completed-theme-item ${!completedTheme ? 'empty' : ''}`}
                        data-tooltip={completedTheme?.name ?? `Theme ${index + 1}`}
                      >
                        {completedTheme && (
                          <div
                            className="completed-theme-user-image"
                            style={{ backgroundImage: `url(${completedTheme.image})` }}
                          />
                        )}
                        <img
                          src={imageTemplate}
                          alt="Theme frame"
                          className="completed-theme-frame"
                        />
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Painel de edição (abre ao clicar no ícone) */}
            {isEditingProfile && (
              <form className="profile-form" onSubmit={handleSaveProfile}>
                <div className="profile-row">
                  <label className="profile-label">Primeiro nome</label>
                  <input
                    className="profile-input"
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    disabled={!isEditingProfile || isSavingProfile}
                  />
                </div>

                <div className="profile-row">
                  <label className="profile-label">Sobrenome</label>
                  <input
                    className="profile-input"
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    disabled={!isEditingProfile || isSavingProfile}
                  />
                </div>

                <div className="profile-row">
                  <label className="profile-label">Escola</label>
                  <input
                    className="profile-input"
                    value={form.schoolName}
                    onChange={(e) => handleChange("schoolName", e.target.value)}
                    disabled={!isEditingProfile || isSavingProfile}
                  />
                </div>

                {profileError && <div className="profile-error">{profileError}</div>}

                <div className="profile-actions">
                  <button type="submit" className="profile-button primary" disabled={isSavingProfile}>
                    {isSavingProfile ? "Salvando..." : "Salvar"}
                  </button>

                  <button type="button" className="profile-button secondary" onClick={handleCancelProfile} disabled={isSavingProfile}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Aqui você pode manter também a seção de trocar senha, se quiser */}
          </>
        )}

        {/* =========================
            TEACHER VIEW
           ========================= */}
        {isTeacher && (
          <>
            <div className="profile-header-new">
              <div className="profile-left">
                <div className="avatar-wrap" onClick={openImagePicker} role="button" tabIndex={0}>
                  {/* imagem */}
                  {user.picture ? (
                    <img className="avatar-img" src={`${user.picture}?v=${pictureVersion}`} alt="Foto do perfil" />
                  ) : (
                    <div className="avatar-fallback" aria-label="Sem foto">
                      <span className="avatar-initials">
                        {(user.firstName?.[0] ?? "U").toUpperCase()}
                        {(user.lastName?.[0] ?? "").toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* overlay hover */}
                  <div className="avatar-overlay">
                    <span className="avatar-overlay-text">Editar imagem</span>
                  </div>

                  {/* input file escondido */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="avatar-file"
                    onChange={handleImageSelected}
                  />

                  {isUploading && <div className="profile-hint">Enviando imagem...</div>}
                  {uploadError && <div className="profile-error">{uploadError}</div>}
                </div>

                <div className="profile-info">
                  <div className="profile-name-row">
                    <h1 className="profile-name" title={displayName}>
                      {displayName}
                    </h1>
                    <button
                      type="button"
                      className="icon-edit"
                      onClick={() => setIsEditingProfile(true)}
                      aria-label="Editar informações do perfil"
                      title="Editar perfil"
                    >
                      ✎
                    </button>
                  </div>
                  <p className="profile-role">Professor</p>
                  <p className="profile-school" title={user.schoolName ?? ""}>
                    {user.schoolName || "Escola não informada"}
                  </p>
                </div>
              </div>

              <div className="profile-right">
                {user.currentMedal && (
                  <div className="profile-medal" data-tooltip={user.currentMedal.name}>
                    <img
                      src={user.currentMedal.image}
                      alt={user.currentMedal.name}
                      className="profile-medal-image"
                    />
                  </div>
                )}
                <div className="profile-score-container">
                  <p className="profile-score-label">Score:</p>
                  <p className="profile-score-value">{user.score ?? 0}</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {user.achievements && user.achievements.length > 0 && (
              <div className="achievements-section">
                <h2 className="achievements-title">Achievements</h2>
                <div className="achievements-grid">
                  {user.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`achievement-item ${achievement.unlockedAt ? 'unlocked' : 'locked'}`}
                      data-tooltip={`${achievement.name}
${achievement.description}
${achievement.unlockedAt ? `Conquistado em: ${new Date(achievement.unlockedAt).toLocaleDateString()}` : 'Bloqueado'}`}
                    >
                      <img
                        src={achievement.image}
                        alt={achievement.name}
                        className="achievement-image"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Themes */}
            <div className="completed-themes-section">
              <h2 className="completed-themes-title">Completed Themes</h2>
              <div className="completed-themes-grid">
                {(() => {
                  const completedCount = user.completedThemes?.length ?? 0;
                  const itemsPerRow = 8;
                  const minRows = 1;
                  const minItems = itemsPerRow * minRows; // 8

                  // Calcula quantas rows são necessárias para que o número de items seja maior que completedCount
                  const requiredRows = Math.ceil((completedCount + 1) / itemsPerRow);
                  const totalRows = Math.max(minRows, requiredRows);
                  const totalItems = totalRows * itemsPerRow;

                  return Array.from({ length: totalItems }).map((_, index) => {
                    const completedTheme = user.completedThemes?.[index];
                    return (
                      <div
                        key={index}
                        className={`completed-theme-item ${!completedTheme ? 'empty' : ''}`}
                        data-tooltip={completedTheme?.name ?? `Theme ${index + 1}`}
                      >
                        {completedTheme && (
                          <div
                            className="completed-theme-user-image"
                            style={{ backgroundImage: `url(${completedTheme.image})` }}
                          />
                        )}
                        <img
                          src={imageTemplate}
                          alt="Theme frame"
                          className="completed-theme-frame"
                        />
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Painel de edição (abre ao clicar no ícone) */}
            {isEditingProfile && (
              <form className="profile-form" onSubmit={handleSaveProfile}>
                <div className="profile-row">
                  <label className="profile-label">Primeiro nome</label>
                  <input
                    className="profile-input"
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    disabled={!isEditingProfile || isSavingProfile}
                  />
                </div>

                <div className="profile-row">
                  <label className="profile-label">Sobrenome</label>
                  <input
                    className="profile-input"
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    disabled={!isEditingProfile || isSavingProfile}
                  />
                </div>

                <div className="profile-row">
                  <label className="profile-label">Escola</label>
                  <input
                    className="profile-input"
                    value={form.schoolName}
                    onChange={(e) => handleChange("schoolName", e.target.value)}
                    disabled={!isEditingProfile || isSavingProfile}
                  />
                </div>

                {profileError && <div className="profile-error">{profileError}</div>}

                <div className="profile-actions">
                  <button type="submit" className="profile-button primary" disabled={isSavingProfile}>
                    {isSavingProfile ? "Salvando..." : "Salvar"}
                  </button>

                  <button type="button" className="profile-button secondary" onClick={handleCancelProfile} disabled={isSavingProfile}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
