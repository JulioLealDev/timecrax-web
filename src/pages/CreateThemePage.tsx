import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImageQuizCard } from "../components/ImageQuizCard";
import { CorrelationRow } from "../components/CorrelationItem";
import type { CardDraft, SavedCard } from "../types";
import "./CreateThemePage.css";
import cardTemplate from "../assets/cardTemplate.png";
import { themesService } from "../services/themes.service";
import { themeAssetsService } from "../services/themeAssests.service";
import { withBaseUrl } from "../utils/withBaseUrl";

/* ============================================================
 * Helpers de slotKey (TEM que bater com seu backend)
 * ========================================================== */
const slotCard = (i: number) => `cards[${i}].imageUrl`;
const slotImageQuiz = (i: number, k: number) => `cards[${i}].imageQuiz.options[${k}].imageUrl`;
const slotCorr = (i: number, k: number) => `cards[${i}].correlationQuiz.items[${k}].imageUrl`;

/* ============================================================
 * Draft inicial
 * ========================================================== */
const createEmptyCardDraft = (orderIndex: number): CardDraft => ({
  orderIndex,
  year: "",
  era: undefined,
  caption: "",

  imageFile: undefined,
  imageUrl: undefined,
  imagePreview: undefined,

  imageQuiz: {
    question: "",
    options: [{}, {}, {}, {}],
    correctIndex: null,
  },

  textQuiz: {
    question: "",
    options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
    correctIndex: null,
  },

  trueFalseQuiz: {
    statement: "",
    answer: null,
  },

  correlationQuiz: {
    prompt: "Correlacione as figuras aos textos corretamente:",
    items: [{ text: "" }, { text: "" }, { text: "" }],
  },
});

/* ============================================================
 * Page
 * ========================================================== */
export function CreateThemePage() {
  const MAX_SAVED_CARDS = 20;
  const MIN_CARDS_PER_THEME = 0;
  const nextOrderIndexRef = useRef(0);

  const [themeName, setThemeName] = useState("");
  const [themeImageDataUrl, setThemeImageDataUrl] = useState<string | null>(null);

  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [card, setCard] = useState<CardDraft>(() => createEmptyCardDraft(0));
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<
    "image-quiz" | "text-quiz" | "trueOrFalse-quiz" | "correlation-quiz"
  >("image-quiz");

  const [assetsSessionId, setAssetsSessionId] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [isUploadingCard, setIsUploadingCard] = useState(false);
  const [isCreatingTheme, setIsCreatingTheme] = useState(false);
  const [createThemeError, setCreateThemeError] = useState<string | null>(null);

  const themeImageInputRef = useRef<HTMLInputElement | null>(null);
  const cardImageInputRef = useRef<HTMLInputElement | null>(null);

  const canSaveTheme = savedCards.length >= MIN_CARDS_PER_THEME;

  /* ============================================================
   * 1) Criar sessão ao entrar na página
   * ========================================================== */
  useEffect(() => {
    (async () => {
      try {
        setIsSessionLoading(true);
        setSessionError(null);

        const res = await themeAssetsService.createSession();
        setAssetsSessionId(res.sessionId);
      } catch (err: any) {
        setSessionError(err?.message ?? "Falha ao criar sessão de upload.");
      } finally {
        setIsSessionLoading(false);
      }
    })();
  }, []);

  /* ============================================================
   * Fechar menu de ações ao clicar fora
   * ========================================================== */
  useEffect(() => {
    function handleClickOutside() {
      setSelectedCardId(null);
    }

    if (selectedCardId) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [selectedCardId]);

  /* ============================================================
   * Utils
   * ========================================================== */
  function nextOrderIndex() {
    const max = savedCards.reduce((acc, c) => Math.max(acc, c.orderIndex), -1);
    return max + 1;
  }

  function isNonEmpty(s: string | undefined | null) {
    return Boolean(s && s.trim().length > 0);
  }

  const hasError = (key: string) => Boolean(errors[key]);
  const tabHasError = (prefix: string) =>
    Object.keys(errors).some((k) => k === prefix || k.startsWith(prefix + "."));

  /* ============================================================
   * Theme image handlers (capa do tema = dataUrl -> vai no ThemeDto.Image)
   * ========================================================== */
  function onPickThemeImage() {
    themeImageInputRef.current?.click();
  }

  function onThemeImageSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        "theme.image": "O arquivo selecionado não é uma imagem válida.",
      }));
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = String(reader.result);

      const img = new Image();
      img.onload = () => {
        if (img.width < 256 || img.height < 256) {
          setErrors((prev) => ({
            ...prev,
            "theme.image": "A imagem do tema deve ter no mínimo 256x256 pixels.",
          }));
          return;
        }

        // imagem válida
        setErrors((prev) => {
          const { ["theme.image"]: _, ...rest } = prev;
          return rest;
        });

        setThemeImageDataUrl(dataUrl);
      };

      img.onerror = () => {
        setErrors((prev) => ({
          ...prev,
          "theme.image": "Falha ao carregar a imagem selecionada.",
        }));
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      setErrors((prev) => ({
        ...prev,
        "theme.image": "Erro ao ler o arquivo de imagem.",
      }));
    };

    reader.readAsDataURL(file);

    // permite selecionar o mesmo arquivo novamente
    e.target.value = "";
  }

  /* ============================================================
   * Card image handlers (imagem principal)
   * ========================================================== */
  function onPickCardImage() {
    cardImageInputRef.current?.click();
  }

  function onCardImageSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCard((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: String(reader.result),
        // não seta imageUrl aqui (imageUrl será URL real após upload)
      }));
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  }

  /* ============================================================
   * ImageQuiz option upload selection
   * (preview pode usar dataUrl e, depois, substituir por URL real)
   * ========================================================== */
  function onImageQuizSelected(index: number, file: File) {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCard((prev) => {
        const options = [...prev.imageQuiz.options];
        options[index] = {
          ...options[index],
          imageFile: file,
          imageUrl: String(reader.result), // preview temporário
        };
        return { ...prev, imageQuiz: { ...prev.imageQuiz, options } };
      });
    };
    reader.readAsDataURL(file);
  }

  /* ============================================================
   * Correlation image selection
   * ========================================================== */
  function onCorrelationImageSelected(i: number, file: File) {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCard((prev) => {
        const items = [...prev.correlationQuiz.items];
        items[i] = {
          ...items[i],
          imageFile: file,
          imageUrl: String(reader.result), // preview temporário
        };
        return { ...prev, correlationQuiz: { ...prev.correlationQuiz, items } };
      });
    };
    reader.readAsDataURL(file);
  }

  /* ============================================================
   * Edit a card (carregar do grid)
   * ========================================================== */
  function loadCardForEdit(saved: SavedCard) {
    setCard({ ...saved });
    setEditingCardId(saved.id);
    setErrors({});
  }

  /* ============================================================
   * Delete a card (remover do grid + backend)
   * ========================================================== */
  async function handleDeleteCard(cardToDelete: SavedCard) {
    if (!assetsSessionId) {
      setErrors((prev) => ({ ...prev, "assets.delete": "Sessão de upload não está pronta." }));
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja deletar a carta "${cardToDelete.caption}" (${cardToDelete.year})?\n\nIsso irá remover todos os assets (8 imagens) do servidor.`
    );

    if (!confirmed) return;

    try {
      // Chama API para deletar assets do backend
      await themeAssetsService.deleteCardAssets(assetsSessionId, cardToDelete.orderIndex);

      // Remove do estado local
      setSavedCards((prev) => prev.filter((c) => c.id !== cardToDelete.id));

      // Se estava editando essa carta, limpa o formulário
      if (editingCardId === cardToDelete.id) {
        setCard(createEmptyCardDraft(nextOrderIndex()));
        setEditingCardId(null);
      }

      // Fecha o menu de ações
      setSelectedCardId(null);
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        "assets.delete": err?.message ?? "Erro ao deletar carta.",
      }));
    }
  }

  /* ============================================================
   * Era (AC/DC): só seleciona, não permite desmarcar
   * ========================================================== */
  function selectEra(next: "AC" | "DC") {
    setCard((prev) => {
      if (prev.era === next) return prev; // não deixa "desmarcar"
      return { ...prev, era: next };
    });
  }

  /* ============================================================
   * Validação
   * ========================================================== */
  function validateCardDraft(d: CardDraft) {
    const e: Record<string, string> = {};

    if (!isNonEmpty(d.year)) e["card.year"] = "Ano é obrigatório.";
    if (!d.era) e["card.era"] = "Selecione A.C. ou D.C.";
    if (!isNonEmpty(d.caption)) e["card.caption"] = "Texto da carta é obrigatório.";
    if (!d.imageFile && !isNonEmpty(d.imageUrl) && !isNonEmpty(d.imagePreview))
      e["card.image"] = "Imagem da carta é obrigatória.";

    if (!isNonEmpty(d.imageQuiz.question)) e["imageQuiz.question"] = "Pergunta do Image Quiz é obrigatória.";
    if (d.imageQuiz.options.length !== 4) e["imageQuiz.options"] = "Image Quiz precisa de 4 opções.";
    d.imageQuiz.options.forEach((opt, i) => {
      if (!opt.imageFile && !isNonEmpty(opt.imageUrl))
        e[`imageQuiz.options.${i}`] = `Imagem da opção ${i + 1} é obrigatória.`;
    });
    if (d.imageQuiz.correctIndex === null) e["imageQuiz.correct"] = "Selecione a imagem correta (Image Quiz).";

    if (!isNonEmpty(d.textQuiz.question)) e["textQuiz.question"] = "Pergunta do Text Quiz é obrigatória.";
    if (d.textQuiz.options.length !== 4) e["textQuiz.options"] = "Text Quiz precisa de 4 opções.";
    d.textQuiz.options.forEach((opt, i) => {
      if (!isNonEmpty(opt.text)) e[`textQuiz.options.${i}`] = `Texto da opção ${i + 1} é obrigatório.`;
    });
    if (d.textQuiz.correctIndex === null) e["textQuiz.correct"] = "Selecione a opção correta (Text Quiz).";

    if (!isNonEmpty(d.trueFalseQuiz.statement)) e["tf.statement"] = "Afirmação do Verdadeiro/Falso é obrigatória.";
    if (d.trueFalseQuiz.answer === null) e["tf.answer"] = "Selecione Verdadeiro ou Falso.";

    if (!isNonEmpty(d.correlationQuiz.prompt)) e["corr.prompt"] = "Texto do Correlation Quiz é obrigatório.";
    if (d.correlationQuiz.items.length !== 3) e["corr.items"] = "Correlation Quiz precisa de 3 itens.";
    d.correlationQuiz.items.forEach((it, i) => {
      if (!it.imageFile && !isNonEmpty(it.imageUrl))
        e[`corr.items.${i}.img`] = `Imagem ${i + 1} (Correlation) é obrigatória.`;
      if (!isNonEmpty(it.text)) e[`corr.items.${i}.text`] = `Texto ${i + 1} (Correlation) é obrigatório.`;
    });

    return e;
  }

  function validateTheme() {
    const e: Record<string, string> = {};

    if (!themeName.trim()) e["theme.name"] = "O nome do tema é obrigatório.";
    if (!themeImageDataUrl) e["theme.image"] = "A imagem do tema é obrigatória.";
    if (savedCards.length < MIN_CARDS_PER_THEME) e["theme.cards"] = `São necessárias pelo menos ${MIN_CARDS_PER_THEME} cartas.`;

    return e;
  }

  /* ============================================================
   * 2) Create/Update card: faz upload de 8 imagens (1 + 4 + 3)
   * ========================================================== */
  async function handleCreateCard() {
    console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

    const e = validateCardDraft(card);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    if (!assetsSessionId) {
      setErrors((prev) => ({ ...prev, "assets.session": "Sessão de upload não está pronta." }));
      return;
    }

    const i = editingCardId ? card.orderIndex : nextOrderIndexRef.current;

    try {
      setIsUploadingCard(true);

      // arquivo principal
      if (!card.imageFile) throw new Error("Imagem principal da carta é obrigatória.");

      // Valida se todos os arquivos existem antes de fazer upload
      for (let k = 0; k < 4; k++) {
        if (!card.imageQuiz.options[k]?.imageFile) {
          throw new Error(`Imagem da opção ${k + 1} do Image Quiz é obrigatória.`);
        }
      }
      for (let k = 0; k < 3; k++) {
        if (!card.correlationQuiz.items[k]?.imageFile) {
          throw new Error(`Imagem ${k + 1} do Correlation é obrigatória.`);
        }
      }

      // Upload de todas as 8 imagens em paralelo
      const [mainResult, ...restResults] = await Promise.all([
        // 1) Imagem principal
        themeAssetsService.uploadOne(assetsSessionId, card.imageFile, slotCard(i)),
        // 2) ImageQuiz (4 imagens)
        ...card.imageQuiz.options.map((opt, k) =>
          themeAssetsService.uploadOne(assetsSessionId, opt.imageFile!, slotImageQuiz(i, k))
        ),
        // 3) Correlation (3 imagens)
        ...card.correlationQuiz.items.map((item, k) =>
          themeAssetsService.uploadOne(assetsSessionId, item.imageFile!, slotCorr(i, k))
        ),
      ]);

      // Extrai URLs dos resultados
      const main = mainResult;
      const imageQuizUrls = restResults.slice(0, 4).map((r) => r.url);
      const corrUrls = restResults.slice(4, 7).map((r) => r.url);

      // monta card salvo com URLs reais
      const newCard: SavedCard = {
        ...card,
        orderIndex: i,
        id: editingCardId ?? crypto.randomUUID(),

        imageUrl: main.url, // URL real

        imageQuiz: {
          ...card.imageQuiz,
          options: card.imageQuiz.options.map((opt, k) => ({
            ...opt,
            imageUrl: imageQuizUrls[k], // URL real
          })),
        },

        correlationQuiz: {
          ...card.correlationQuiz,
          items: card.correlationQuiz.items.map((it, k) => ({
            ...it,
            imageUrl: corrUrls[k], // URL real
          })),
        },
      };

      if (editingCardId) {
        setSavedCards((prev) => prev.map((c) => (c.id === editingCardId ? newCard : c)));
        setEditingCardId(null);
      } else {
        setSavedCards((prev) => [newCard, ...prev].slice(0, MAX_SAVED_CARDS));
        nextOrderIndexRef.current = i + 1;
      }

      setCard(createEmptyCardDraft(nextOrderIndex()));
      setErrors({});
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, "assets.upload": err?.message ?? "Erro ao enviar imagens da carta." }));
    } finally {
      setIsUploadingCard(false);
    }
  }

  /* ============================================================
   * 3) Save Theme: POST /themes com ThemeDto
   * ========================================================== */
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setCreateThemeError(null);

    const themeErrors = validateTheme();
    setErrors(themeErrors);
    if (Object.keys(themeErrors).length > 0) return;

    if (!assetsSessionId) {
      setCreateThemeError("Sessão de upload não está pronta.");
      return;
    }

    try {
      setIsCreatingTheme(true);

      // 1) Ordena para manter coerência com slotKey (cards[i]...)
      const ordered = savedCards
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex);

      // 2) Valida duplicidade de orderIndex (deve ser impossível, mas protege)
      const seen = new Set<number>();
      const duplicates: number[] = [];
      for (const c of ordered) {
        if (seen.has(c.orderIndex)) duplicates.push(c.orderIndex);
        else seen.add(c.orderIndex);
      }
      if (duplicates.length > 0) {
        setCreateThemeError(
          `Existem cartas com orderIndex duplicado (${[...new Set(duplicates)].join(
            ", "
          )}). Recrie as cartas ou recarregue a página.`
        );
        return;
      }

      const payload = {
        name: themeName.trim(),
        image: themeImageDataUrl!,      // dataUrl
        uploadSessionId: assetsSessionId,
        cards: ordered.map((c) => ({
          orderIndex: c.orderIndex,
          year: Number(c.year),
          era: c.era,
          caption: c.caption,
          imageUrl: withBaseUrl(c.imageUrl) ?? "",

          imageQuiz: {
            question: c.imageQuiz.question,
            options: c.imageQuiz.options.map((o) => ({ imageUrl: withBaseUrl(o.imageUrl) ?? "",})),
            correctIndex: c.imageQuiz.correctIndex ?? 0,
          },

          textQuiz: {
            question: c.textQuiz.question,
            options: c.textQuiz.options.map((o) => ({ text: o.text })),
            correctIndex: c.textQuiz.correctIndex ?? 0,
          },

          trueFalseQuiz: {
            statement: c.trueFalseQuiz.statement,
            answer: c.trueFalseQuiz.answer === "true",
          },

          correlationQuiz: {
            items: c.correlationQuiz.items.map((it) => ({
              text: it.text,
              imageUrl: withBaseUrl(it.imageUrl) ?? "",
            })),
          },
        })),
      };

      const created = await themesService.createTheme(payload as any);
      console.log("Theme created:", created);

      // reset
      nextOrderIndexRef.current = 0;
      setThemeName("");
      setThemeImageDataUrl(null);
      setSavedCards([]);
      setEditingCardId(null);
      setCard(createEmptyCardDraft(0));
      setErrors({});
    } catch (err: any) {
      setCreateThemeError(err?.message ?? "Erro ao criar tema.");
    } finally {
      setIsCreatingTheme(false);
    }
  }

  /* ============================================================
   * Render helpers
   * ========================================================== */
  const cardMainPreview = card.imagePreview ?? card.imageUrl;

  return (
    <div className="create-theme-page">
      <main className="create-theme-container">
        <h1 className="create-theme-title">Create New Theme</h1>

        {sessionError && <div className="field-error">{sessionError}</div>}
        {hasError("assets.session") && <div className="field-error">{errors["assets.session"]}</div>}
        {hasError("assets.upload") && <div className="field-error">{errors["assets.upload"]}</div>}

        <form className="create-theme-form" onSubmit={onSubmit}>
          {/* TOP ROW: name + theme image */}
          <div className="theme-top-row">
            <label className="field theme-name-field">
              <h2 className="field-label">Theme's Name</h2>
              <input
                className={["field-input", hasError("theme.name") ? "is-invalid" : ""].join(" ")}
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="Ex: French Revolution"
              />
              {hasError("theme.name") && <div className="field-error">{errors["theme.name"]}</div>}
            </label>

            <div className="theme-image-field">
              <h2 className="field-label">Theme's Image</h2>

              <input
                ref={themeImageInputRef}
                type="file"
                accept="image/*"
                onChange={onThemeImageSelected}
                className="hidden-file"
              />

              <button
                type="button"
                className="theme-image-circle"
                onClick={onPickThemeImage}
                aria-label="Upload theme image"
                data-tooltip="Upload theme image"
              >
                {themeImageDataUrl ? (
                  <img className="theme-image-preview" src={themeImageDataUrl} alt="Theme preview" />
                ) : (
                  <span className="theme-image-placeholder">UPLOAD</span>
                )}
              </button>

              {hasError("theme.image") && <div className="field-error">{errors["theme.image"]}</div>}
            </div>
          </div>

          {/* CARD BUILDER */}
          <section className="card-builder">
            <div className="card-builder-header">
              <h2 className="card-builder-title">
                Add Card
                <span className="info-tooltip">
                  <span className="info-icon" aria-label="Informação" role="img">
                    i
                  </span>
                  <span className="tooltip-box">
                    Fill in all the fields on the event card and quizzes to create the card.
                  </span>
                </span>
              </h2>
            </div>

            <div className="card-builder-row">
              {/* LEFT: Card */}
              <div className="card-preview-wrap">
                <div className="card-preview">
                  <input
                    ref={cardImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onCardImageSelected}
                    className="hidden-file"
                  />

                  <button
                    type="button"
                    className="card-image-hitbox"
                    onClick={onPickCardImage}
                    aria-label="Upload de imagem da carta"
                  >
                    {cardMainPreview ? (
                      <img className="card-user-image" src={cardMainPreview} alt="Imagem da carta" />
                    ) : (
                      <div className="card-image-placeholder">CLICK TO UPLOAD THE EVENT IMAGE</div>
                    )}
                  </button>

                  <img
                    className={["card-frame", hasError("card.image") ? "is-invalid-frame" : ""].join(" ")}
                    src={cardTemplate}
                    alt="Template da carta"
                  />

                  <textarea
                    className={["card-caption-input", hasError("card.caption") ? "is-invalid-text" : ""].join(" ")}
                    value={card.caption}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 35);
                      setCard((prev) => ({ ...prev, caption: value }));
                    }}
                    placeholder="Type the event name"
                    rows={2}
                  />
                </div>

                {/* Year + Era na mesma linha */}
                <div className="card-year-field">
                  <div className="year-era-row">
                    <label className="field-inline">
                      <span className="field-label">Year:</span>
                      <input
                        className={["field-input", "card-year-input", hasError("card.year") ? "is-invalid" : ""].join(" ")}
                        placeholder="Ex: 1789"
                        inputMode="numeric"
                        maxLength={6}
                        value={card.year}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          setCard((prev) => ({ ...prev, year: digitsOnly }));
                        }}
                      />
                    </label>

                    <div className={["era-options", hasError("card.era") ? "era-invalid" : ""].join(" ")}>
                      <label className="era-option">
                        <input
                          type="checkbox"
                          checked={card.era === "AC"}
                          onChange={() => selectEra("AC")}
                        />
                        <span>A.C.</span>
                      </label>

                      <label className="era-option">
                        <input
                          type="checkbox"
                          checked={card.era === "DC"}
                          onChange={() => selectEra("DC")}
                        />
                        <span>D.C.</span>
                      </label>
                    </div>
                  </div>

                  {(hasError("card.year") || hasError("card.era")) && (
                    <div className="field-error">
                      {errors["card.year"] ?? errors["card.era"]}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="create-card-button"
                  onClick={handleCreateCard}
                  disabled={isUploadingCard || isSessionLoading}
                >
                  {isUploadingCard ? "Uploading..." : editingCardId ? "Update Card" : "Create Card"}
                </button>
              </div>

              {/* RIGHT: Tabs */}
              <div className="card-side-panel">
                <div className="tabs-header">
                  <button
                    type="button"
                    className={["tab-btn", activeTab === "image-quiz" ? "active" : "", tabHasError("imageQuiz") ? "tab-error" : ""].join(" ")}
                    onClick={() => setActiveTab("image-quiz")}
                  >
                    Image Quiz
                  </button>

                  <button
                    type="button"
                    className={["tab-btn", activeTab === "text-quiz" ? "active" : "", tabHasError("textQuiz") ? "tab-error" : ""].join(" ")}
                    onClick={() => setActiveTab("text-quiz")}
                  >
                    Text Quiz
                  </button>

                  <button
                    type="button"
                    className={["tab-btn", activeTab === "trueOrFalse-quiz" ? "active" : "", tabHasError("tf") ? "tab-error" : ""].join(" ")}
                    onClick={() => setActiveTab("trueOrFalse-quiz")}
                  >
                    True or False Quiz
                  </button>

                  <button
                    type="button"
                    className={["tab-btn", activeTab === "correlation-quiz" ? "active" : "", tabHasError("corr") ? "tab-error" : ""].join(" ")}
                    onClick={() => setActiveTab("correlation-quiz")}
                  >
                    Correlation Quiz
                  </button>
                </div>

                <div className="tabs-content">
                  {/* Image Quiz */}
                  {activeTab === "image-quiz" && (
                    <>
                      <label className="field field-inline">
                        <span className="field-label">Question:</span>
                        <input
                          className={["field-input", "quiz-question-input", hasError("imageQuiz.question") ? "is-invalid" : ""].join(" ")}
                          placeholder="Ex: Which image represent this event?"
                          value={card.imageQuiz.question}
                          onChange={(e) =>
                            setCard((prev) => ({
                              ...prev,
                              imageQuiz: { ...prev.imageQuiz, question: e.target.value },
                            }))
                          }
                        />
                      </label>

                      <div className="image-quiz-grid">
                        {card.imageQuiz.options.map((option, index) => (
                          <ImageQuizCard
                            key={index}
                            index={index}
                            imageDataUrl={withBaseUrl(option.imageUrl) ?? ""} // preview (dataUrl) ou URL real
                            onImageSelected={onImageQuizSelected}
                            checked={card.imageQuiz.correctIndex === index}
                            invalidFrame={hasError(`imageQuiz.options.${index}`)}
                            invalidCheckbox={hasError("imageQuiz.correct")}
                            onSelectCorrect={(i) =>
                              setCard((prev) => ({
                                ...prev,
                                imageQuiz: { ...prev.imageQuiz, correctIndex: i },
                              }))
                            }
                          />
                        ))}
                      </div>

                      {hasError("imageQuiz.correct") && <div className="field-error">{errors["imageQuiz.correct"]}</div>}
                    </>
                  )}

                  {/* Text Quiz */}
                  {activeTab === "text-quiz" && (
                    <>
                      <label className="field field-inline">
                        <span className="field-label">Pergunta</span>
                        <input
                          className={["field-input", "quiz-question-input", hasError("textQuiz.question") ? "is-invalid" : ""].join(" ")}
                          placeholder="Ex: Which quote is related to the event?"
                          value={card.textQuiz.question}
                          onChange={(e) =>
                            setCard((prev) => ({
                              ...prev,
                              textQuiz: { ...prev.textQuiz, question: e.target.value },
                            }))
                          }
                        />
                      </label>

                      <div className="text-quiz-list">
                        {card.textQuiz.options.map((opt, index) => (
                          <div key={index} className="text-quiz-row">
                            <input
                              type="checkbox"
                              className={["text-quiz-check", hasError("textQuiz.correct") ? "is-invalid-checkbox" : ""].join(" ")}
                              checked={card.textQuiz.correctIndex === index}
                              onChange={() =>
                                setCard((prev) => ({
                                  ...prev,
                                  textQuiz: { ...prev.textQuiz, correctIndex: index },
                                }))
                              }
                            />

                            <textarea
                              className={["text-quiz-textarea", hasError(`textQuiz.options.${index}`) ? "is-invalid" : ""].join(" ")}
                              value={opt.text}
                              onChange={(e) =>
                                setCard((prev) => {
                                  const options = [...prev.textQuiz.options];
                                  options[index] = { text: e.target.value };
                                  return { ...prev, textQuiz: { ...prev.textQuiz, options } };
                                })
                              }
                              placeholder={`Option ${index + 1}`}
                              rows={2}
                            />
                          </div>
                        ))}
                      </div>

                      {hasError("textQuiz.correct") && <div className="field-error">{errors["textQuiz.correct"]}</div>}
                    </>
                  )}

                  {/* True/False */}
                  {activeTab === "trueOrFalse-quiz" && (
                    <>
                      <label className="field">
                        <textarea
                          className={["field-textarea", hasError("tf.statement") ? "is-invalid" : ""].join(" ")}
                          value={card.trueFalseQuiz.statement}
                          onChange={(e) =>
                            setCard((prev) => ({
                              ...prev,
                              trueFalseQuiz: { ...prev.trueFalseQuiz, statement: e.target.value },
                            }))
                          }
                          placeholder="Type the affirmation..."
                          rows={4}
                        />
                      </label>

                      <div className={["tf-options", hasError("tf.answer") ? "row-invalid" : ""].join(" ")}>
                        <label className="tf-option">
                          <input
                            type="checkbox"
                            checked={card.trueFalseQuiz.answer === "true"}
                            onChange={() =>
                              setCard((prev) => ({
                                ...prev,
                                trueFalseQuiz: { ...prev.trueFalseQuiz, answer: "true" },
                              }))
                            }
                          />
                          <span>True</span>
                        </label>

                        <label className="tf-option">
                          <input
                            type="checkbox"
                            checked={card.trueFalseQuiz.answer === "false"}
                            onChange={() =>
                              setCard((prev) => ({
                                ...prev,
                                trueFalseQuiz: { ...prev.trueFalseQuiz, answer: "false" },
                              }))
                            }
                          />
                          <span>False</span>
                        </label>
                      </div>

                      {hasError("tf.answer") && <div className="field-error">{errors["tf.answer"]}</div>}
                    </>
                  )}

                  {/* Correlation */}
                  {activeTab === "correlation-quiz" && (
                    <>
                      <div className="correlation-list">
                        {card.correlationQuiz.items.map((item, index) => (
                          <CorrelationRow
                            key={index}
                            index={index}
                            imageDataUrl={withBaseUrl(item.imageUrl ?? "")} // preview (dataUrl) ou URL real
                            text={item.text}
                            onImageSelected={onCorrelationImageSelected}
                            invalidImage={hasError(`corr.items.${index}.img`)}
                            invalidText={hasError(`corr.items.${index}.text`)}
                            onTextChange={(value) =>
                              setCard((prev) => {
                                const items = [...prev.correlationQuiz.items];
                                items[index] = { ...items[index], text: value };
                                return { ...prev, correlationQuiz: { ...prev.correlationQuiz, items } };
                              })
                            }
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Added Cards */}
          <section className="added-cards-section">
            <h2 className="added-cards-title">
              Added Cards
              <span className="info-tooltip">
                <span className="info-icon" aria-label="Informação" role="img">
                  i
                </span>
                <span className="tooltip-box">You need at least 12 cards to create a new theme.</span>
              </span>
            </h2>

            <div className="added-cards-grid">
              {Array.from({ length: MAX_SAVED_CARDS }).map((_, i) => {
                const c = savedCards[i];
                const isFilled = Boolean(c);
                const isSelected = c?.id === selectedCardId;

                return (
                  <div key={i} className="added-card-wrapper">
                    <button
                      type="button"
                      className={["added-card-thumb", isFilled ? "filled" : "empty"].join(" ")}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (c) {
                          setSelectedCardId(isSelected ? null : c.id);
                        }
                      }}
                      disabled={!c}
                      aria-label={c ? `Selecionar carta ${c.caption} (${c.year})` : `Slot vazio ${i + 1}`}
                    >
                      <img
                        className={["added-card-frame", c?.id === editingCardId ? "selected" : ""].join(" ")}
                        src={cardTemplate}
                        alt=""
                      />

                      {c?.imageUrl && (
                        <img
                          className="added-card-image"
                          src={withBaseUrl(c.imageUrl) ?? undefined}
                          alt=""
                        />
                      )}
                    </button>

                    {isSelected && c && (
                      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="edit-card-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            loadCardForEdit(c);
                            setSelectedCardId(null);
                          }}
                          aria-label="Editar carta"
                          data-tooltip="Editar carta"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="delete-card-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCard(c);
                          }}
                          aria-label="Deletar carta"
                          data-tooltip="Deletar carta"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {hasError("theme.cards") && <div className="field-error">{errors["theme.cards"]}</div>}
          </section>

          {/* Save Theme */}
          <div className="form-actions">
            <button
              className="primary-button"
              type="submit"
              disabled={!canSaveTheme || isCreatingTheme || isSessionLoading}
            >
              {isCreatingTheme ? "Saving..." : "Save Theme"}
            </button>

            {createThemeError && <div className="field-error">{createThemeError}</div>}
          </div>
        </form>
      </main>
    </div>
  );
}
