import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ImageQuizCard } from "../components/ImageQuizCard";
import { CorrelationRow } from "../components/CorrelationItem";
import { ErrorModal } from "../components/ErrorModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { CustomSelect } from "../components/CustomSelect";
import type { CardDraft, SavedCard } from "../types";
import "./CreateThemePage.css";
import cardTemplate from "../assets/newCardTemplate.png";
import themeFrameTemplate from "../assets/themeFrameTemplate.png";
import { themesService, type ThemeCardResponse } from "../services/themes.service";
import { themeAssetsService, type UploadAssetResponse } from "../services/themeAssests.service";
import { withBaseUrl } from "../utils/withBaseUrl";

/* ============================================================
 * Helpers de slotKey (TEM que bater com seu backend)
 * ========================================================== */
const slotCard = (i: number) => `cards[${i}].imageUrl`;
const slotImageQuiz = (i: number, k: number) => `cards[${i}].imageQuiz.options[${k}].imageUrl`;
const slotCorr = (i: number, k: number) => `cards[${i}].correlationQuiz.items[${k}].imageUrl`;
const slotLocalizationMap = (i: number) => `cards[${i}].localizationQuiz.mapImageUrl`;

/* ============================================================
 * Localization map constants
 * ========================================================== */
const WORLD_MAP_URL = "/images/world-map.png";
const LOC_SCALE_MIN = 0.3;
const LOC_SCALE_MAX = 8;

/* ============================================================
 * ID Generator (fallback for crypto.randomUUID)
 * ========================================================== */
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

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
    prompt: "Match the images to the texts correctly:",
    items: [{ text: "" }, { text: "" }, { text: "" }],
  },

  localizationQuiz: {
    mapImageFile: undefined,
    mapImageUrl: undefined,
    mapImagePreview: undefined,
    mapOffset: { x: 0, y: 0 },
    mapScale: 0,
    spots: [],
  },
});

/* ============================================================
 * Page
 * ========================================================== */
export function CreateThemePage() {
  const { t } = useTranslation();
  const MAX_SAVED_CARDS = 20;
  const MIN_CARDS_PER_THEME = 0;
  const nextOrderIndexRef = useRef(0);

  const [themeName, setThemeName] = useState("");
  const [themeResume, setThemeResume] = useState("");
  const [themeRecommendation, setThemeRecommendation] = useState("");
  const [themeImageDataUrl, setThemeImageDataUrl] = useState<string | null>(null);

  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [card, setCard] = useState<CardDraft>(() => createEmptyCardDraft(0));
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<
    "image-quiz" | "text-quiz" | "trueOrFalse-quiz" | "correlation-quiz" | "localization"
  >("image-quiz");

  const [assetsSessionId, setAssetsSessionId] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const [isUploadingCard, setIsUploadingCard] = useState(false);
  const [isCreatingTheme, setIsCreatingTheme] = useState(false);

  // Edit mode states
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalErrors, setErrorModalErrors] = useState<Record<string, string>>({});

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<SavedCard | null>(null);

  const themeImageInputRef = useRef<HTMLInputElement | null>(null);
  const cardImageInputRef = useRef<HTMLInputElement | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapImgRef = useRef<HTMLImageElement>(null);
  const isDraggingRef = useRef(false);
  const movedRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, offsetX: 0, offsetY: 0 });
  const locOffsetRef = useRef({ x: 0, y: 0 });
  const locScaleRef = useRef(0);
  const [locIsDragging, setLocIsDragging] = useState(false);

  // Hooks
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = editingThemeId !== null;

  const canSaveTheme = savedCards.length >= MIN_CARDS_PER_THEME;
  const isCardBuilderDisabled = savedCards.length >= MAX_SAVED_CARDS;

  /* ============================================================
   * 0) Load theme for edit mode
   * ========================================================== */
  useEffect(() => {
    const editId = searchParams.get("edit");

    if (editId) {
      (async () => {
        try {
          setIsLoadingTheme(true);

          const theme = await themesService.getTheme(editId);

          // Populate form states
          setEditingThemeId(editId);
          setThemeName(theme.name);
          setThemeResume(theme.resume || "");
          setThemeRecommendation(theme.recommendation || "");
          setThemeImageDataUrl(theme.image || null);

          // Transform cards from API to SavedCard
          const loadedCards: SavedCard[] = theme.cards.map((card: ThemeCardResponse) => ({
            id: card.id || generateId(), // Garantir ID único
            orderIndex: card.orderIndex,
            year: String(card.year),
            era: card.era,
            caption: card.caption,
            imageUrl: card.imageUrl,
            imageFile: undefined,
            imagePreview: undefined,

            imageQuiz: {
              question: card.imageQuiz.question,
              options: card.imageQuiz.options.map((opt) => ({
                imageUrl: opt.imageUrl,
                imageFile: undefined,
              })),
              correctIndex: card.imageQuiz.correctIndex,
            },

            textQuiz: {
              question: card.textQuiz.question,
              options: card.textQuiz.options,
              correctIndex: card.textQuiz.correctIndex,
            },

            trueFalseQuiz: {
              statement: card.trueFalseQuiz.statement,
              answer: card.trueFalseQuiz.answer ? "true" : "false",
            },

            correlationQuiz: {
              prompt: "Match the images to the texts correctly:",
              items: card.correlationQuiz.items.map((item) => ({
                text: item.text,
                imageUrl: item.imageUrl,
                imageFile: undefined,
              })),
            },

            localizationQuiz: {
              mapImageUrl: card.localizationQuiz?.mapImageUrl ?? "",
              mapImageFile: undefined,
              mapImagePreview: undefined,
              mapOffset: { x: 0, y: 0 },
              mapScale: 0,
              spots: card.localizationQuiz?.spots ?? [],
            },
          }));

          setSavedCards(loadedCards);

          // Update next orderIndex
          const maxOrder = loadedCards.reduce((max, c) => Math.max(max, c.orderIndex), -1);
          nextOrderIndexRef.current = maxOrder + 1;

        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : "Failed to load theme for editing.";
          setEditingThemeId(null);
          setErrorModalErrors({ "load.theme": errorMsg });
          setShowErrorModal(true);
        } finally {
          setIsLoadingTheme(false);
        }
      })();
    }
  }, [searchParams]);

  /* ============================================================
   * 1) Criar sessão ao entrar na página
   * ========================================================== */
  useEffect(() => {
    // Aguarda o carregamento do tema terminar antes de criar a sessão
    if (isLoadingTheme) return;

    (async () => {
      try {
        setIsSessionLoading(true);

        // Se estiver editando, passa o themeId. Caso contrário, passa undefined
        const res = await themeAssetsService.createSession(editingThemeId || undefined);
        setAssetsSessionId(res.sessionId);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Failed to create upload session.";
        setErrorModalErrors({ "assets.session": errorMsg });
        setShowErrorModal(true);
      } finally {
        setIsSessionLoading(false);
      }
    })();
  }, [isLoadingTheme, editingThemeId]);

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
   * Keep localization refs in sync with card state
   * ========================================================== */
  useEffect(() => {
    locOffsetRef.current = card.localizationQuiz.mapOffset;
    locScaleRef.current = card.localizationQuiz.mapScale;
  }, [card.localizationQuiz.mapOffset, card.localizationQuiz.mapScale]);

  /* ============================================================
   * Non-passive wheel listener for map zoom
   * ========================================================== */
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = container!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 0.9;
      const oldScale = locScaleRef.current;
      const newScale = Math.max(LOC_SCALE_MIN, Math.min(LOC_SCALE_MAX, oldScale * factor));
      const ratio = newScale / oldScale;
      const oldOffset = locOffsetRef.current;
      setCard(prev => ({
        ...prev,
        localizationQuiz: {
          ...prev.localizationQuiz,
          mapScale: newScale,
          mapOffset: {
            x: mouseX - (mouseX - oldOffset.x) * ratio,
            y: mouseY - (mouseY - oldOffset.y) * ratio,
          },
        },
      }));
    }

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [activeTab]); // re-runs when localization tab activates so ref is populated

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
        "theme.image": t("createTheme.errorInvalidImage"),
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
            "theme.image": t("createTheme.errorImageMinSize"),
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
          "theme.image": t("createTheme.errorImageLoad"),
        }));
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      setErrors((prev) => ({
        ...prev,
        "theme.image": t("createTheme.errorImageRead"),
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
   * Localization map handlers
   * ========================================================== */
  function handleMapImageLoad() {
    const img = mapImgRef.current;
    const container = mapContainerRef.current;
    if (!img || !container || locScaleRef.current > 0) return;
    const scale = container.clientWidth / img.naturalWidth;
    const offsetY = (container.clientHeight - img.naturalHeight * scale) / 2;
    setCard(prev => ({
      ...prev,
      localizationQuiz: {
        ...prev.localizationQuiz,
        mapScale: scale,
        mapOffset: { x: 0, y: Math.max(0, offsetY) },
      },
    }));
  }

  function handleMapMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    isDraggingRef.current = true;
    movedRef.current = false;
    setLocIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      offsetX: locOffsetRef.current.x,
      offsetY: locOffsetRef.current.y,
    };
    e.preventDefault();
  }

  function handleMapMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedRef.current = true;
    setCard(prev => ({
      ...prev,
      localizationQuiz: {
        ...prev.localizationQuiz,
        mapOffset: {
          x: dragStartRef.current.offsetX + dx,
          y: dragStartRef.current.offsetY + dy,
        },
      },
    }));
  }

  function handleMapMouseUp() {
    isDraggingRef.current = false;
    setLocIsDragging(false);
  }

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    if (movedRef.current) return;
    if (card.localizationQuiz.spots.length >= 4) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setCard(prev => {
      const spots = [...prev.localizationQuiz.spots];
      spots.push({ x, y, isCorrect: spots.length === 0 });
      return { ...prev, localizationQuiz: { ...prev.localizationQuiz, spots } };
    });
  }

  function handleRemoveSpot(index: number, e: React.MouseEvent) {
    e.stopPropagation();
    setCard(prev => {
      const wasCorrect = prev.localizationQuiz.spots[index].isCorrect;
      const spots = prev.localizationQuiz.spots.filter((_, i) => i !== index);
      if (wasCorrect && spots.length > 0) spots[0] = { ...spots[0], isCorrect: true };
      return { ...prev, localizationQuiz: { ...prev.localizationQuiz, spots } };
    });
  }

  function handleSetCorrectSpot(index: number) {
    setCard(prev => ({
      ...prev,
      localizationQuiz: {
        ...prev.localizationQuiz,
        spots: prev.localizationQuiz.spots.map((s, i) => ({ ...s, isCorrect: i === index })),
      },
    }));
  }

  function resetLocalizationMap() {
    const img = mapImgRef.current;
    const container = mapContainerRef.current;
    if (!img || !container) return;
    const scale = container.clientWidth / img.naturalWidth;
    const offsetY = (container.clientHeight - img.naturalHeight * scale) / 2;
    setCard(prev => ({
      ...prev,
      localizationQuiz: {
        ...prev.localizationQuiz,
        mapScale: scale,
        mapOffset: { x: 0, y: Math.max(0, offsetY) },
      },
    }));
  }

  function captureMapArea() {
    const container = mapContainerRef.current;
    const img = mapImgRef.current;
    if (!container || !img || card.localizationQuiz.spots.length === 0) return;

    const { width, height } = container.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x: ox, y: oy } = card.localizationQuiz.mapOffset;
    const scale = card.localizationQuiz.mapScale;
    const tileW = img.naturalWidth * scale;
    const tileH = img.naturalHeight * scale;
    const normX = ((ox % tileW) + tileW) % tileW - tileW;
    for (let x = normX; x < width; x += tileW) {
      ctx.drawImage(img, x, oy, tileW, tileH);
    }

    card.localizationQuiz.spots.forEach((spot, idx) => {
      const sx = spot.x * width;
      const sy = spot.y * height;
      ctx.beginPath();
      ctx.arc(sx, sy, 10, 0, Math.PI * 2);
      ctx.fillStyle = spot.isCorrect ? "#22c55e" : "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(idx + 1), sx, sy);
    });

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "map-capture.jpg", { type: "image/jpeg" });
      setCard(prev => ({
        ...prev,
        localizationQuiz: {
          ...prev.localizationQuiz,
          mapImageFile: file,
          mapImagePreview: dataUrl,
        },
      }));
    }, "image/jpeg", 0.92);
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
  function handleDeleteCard(card: SavedCard) {
    if (!assetsSessionId) {
      setErrors((prev) => ({ ...prev, "assets.delete": t("createTheme.errorUploadSession") }));
      return;
    }
    setCardToDelete(card);
    setShowDeleteModal(true);
  }

  async function confirmDeleteCard() {
    if (!cardToDelete || !assetsSessionId) return;

    setShowDeleteModal(false);

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

      // Limpa o estado do card a deletar
      setCardToDelete(null);
    } catch (err: unknown) {
      setErrors((prev) => ({
        ...prev,
        "assets.delete": err instanceof Error ? err.message : t("createTheme.errorDeleteCard"),
      }));
      setCardToDelete(null);
    }
  }

  function cancelDeleteCard() {
    setShowDeleteModal(false);
    setCardToDelete(null);
  }

  /* ============================================================
   * Era (AC/DC): só seleciona, não permite desmarcar
   * ========================================================== */
  function selectEra(next: "BC" | "AD") {
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

    if (!isNonEmpty(d.year)) e["card.year"] = t("createTheme.errorYear");
    if (!d.era) e["card.era"] = t("createTheme.errorEra");
    if (!isNonEmpty(d.caption)) e["card.caption"] = t("createTheme.errorCaption");
    if (!d.imageFile && !isNonEmpty(d.imageUrl) && !isNonEmpty(d.imagePreview))
      e["card.image"] = t("createTheme.errorCardImage");

    if (!isNonEmpty(d.imageQuiz.question)) e["imageQuiz.question"] = t("createTheme.errorImageQuizQuestion");
    if (d.imageQuiz.options.length !== 4) e["imageQuiz.options"] = t("createTheme.errorImageQuizOptions");
    d.imageQuiz.options.forEach((opt, i) => {
      if (!opt.imageFile && !isNonEmpty(opt.imageUrl))
        e[`imageQuiz.options.${i}`] = t("createTheme.errorImageQuizOptionImage", { num: i + 1 });
    });
    if (d.imageQuiz.correctIndex === null) e["imageQuiz.correct"] = t("createTheme.errorImageQuizCorrect");

    if (!isNonEmpty(d.textQuiz.question)) e["textQuiz.question"] = t("createTheme.errorTextQuizQuestion");
    if (d.textQuiz.options.length !== 4) e["textQuiz.options"] = t("createTheme.errorTextQuizOptions");
    d.textQuiz.options.forEach((opt, i) => {
      if (!isNonEmpty(opt.text)) e[`textQuiz.options.${i}`] = t("createTheme.errorTextQuizOptionText", { num: i + 1 });
    });
    if (d.textQuiz.correctIndex === null) e["textQuiz.correct"] = t("createTheme.errorTextQuizCorrect");

    if (!isNonEmpty(d.trueFalseQuiz.statement)) e["tf.statement"] = t("createTheme.errorTrueFalseStatement");
    if (d.trueFalseQuiz.answer === null) e["tf.answer"] = t("createTheme.errorTrueFalseAnswer");

    if (!isNonEmpty(d.correlationQuiz.prompt)) e["corr.prompt"] = t("createTheme.errorCorrelationPrompt");
    if (d.correlationQuiz.items.length !== 3) e["corr.items"] = t("createTheme.errorCorrelationItems");
    d.correlationQuiz.items.forEach((it, i) => {
      if (!it.imageFile && !isNonEmpty(it.imageUrl))
        e[`corr.items.${i}.img`] = t("createTheme.errorCorrelationImage", { num: i + 1 });
      if (!isNonEmpty(it.text)) e[`corr.items.${i}.text`] = t("createTheme.errorCorrelationText", { num: i + 1 });
    });

    if (!d.localizationQuiz.mapImageFile && !d.localizationQuiz.mapImageUrl)
      e["loc.mapImage"] = t("createTheme.errorLocalizationCapture");
    if (d.localizationQuiz.spots.length !== 4) e["loc.spots"] = t("createTheme.errorLocalizationSpots");
    if (d.localizationQuiz.spots.length === 4 && !d.localizationQuiz.spots.some((s) => s.isCorrect))
      e["loc.correct"] = t("createTheme.errorLocalizationCorrect");

    return e;
  }

  function validateTheme() {
    const e: Record<string, string> = {};

    if (!themeName.trim()) e["theme.name"] = t("createTheme.errorThemeName");
    if (!themeResume.trim()) e["theme.resume"] = t("createTheme.errorResume");
    if (!themeRecommendation.trim()) e["theme.recommendation"] = t("createTheme.errorRecommendation");
    if (!themeImageDataUrl) e["theme.image"] = t("createTheme.errorThemeImage");
    if (savedCards.length < MIN_CARDS_PER_THEME) e["theme.cards"] = t("createTheme.errorMinCards", { min: MIN_CARDS_PER_THEME });

    return e;
  }

  /* ============================================================
   * 2) Create/Update card: faz upload de 8 imagens (1 + 4 + 3)
   * ========================================================== */
  async function handleCreateCard() {
    const e = validateCardDraft(card);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setErrorModalErrors(e);
      setShowErrorModal(true);
      return;
    }

    if (!assetsSessionId) {
      setErrors((prev) => ({ ...prev, "assets.session": t("createTheme.errorUploadSession") }));
      return;
    }

    const i = editingCardId ? card.orderIndex : nextOrderIndexRef.current;

    try {
      setIsUploadingCard(true);

      // Prepare upload tasks only for new images
      const uploadTasks: Promise<UploadAssetResponse>[] = [];
      const uploadMap: { type: string; index?: number }[] = [];

      // Main image
      if (card.imageFile) {
        uploadTasks.push(themeAssetsService.uploadOne(assetsSessionId, card.imageFile, slotCard(i)));
        uploadMap.push({ type: "main" });
      } else if (!card.imageUrl) {
        throw new Error("Card main image is required.");
      }

      // ImageQuiz options
      for (let k = 0; k < 4; k++) {
        const opt = card.imageQuiz.options[k];
        if (opt?.imageFile) {
          uploadTasks.push(themeAssetsService.uploadOne(assetsSessionId, opt.imageFile, slotImageQuiz(i, k)));
          uploadMap.push({ type: "imageQuiz", index: k });
        } else if (!opt?.imageUrl) {
          throw new Error(`Image Quiz option ${k + 1} image is required.`);
        }
      }

      // Correlation items
      for (let k = 0; k < 3; k++) {
        const item = card.correlationQuiz.items[k];
        if (item?.imageFile) {
          uploadTasks.push(themeAssetsService.uploadOne(assetsSessionId, item.imageFile, slotCorr(i, k)));
          uploadMap.push({ type: "correlation", index: k });
        } else if (!item?.imageUrl) {
          throw new Error(`Correlation image ${k + 1} is required.`);
        }
      }

      // Localization map
      if (card.localizationQuiz.mapImageFile) {
        uploadTasks.push(themeAssetsService.uploadOne(assetsSessionId, card.localizationQuiz.mapImageFile, slotLocalizationMap(i)));
        uploadMap.push({ type: "localizationMap" });
      } else if (!card.localizationQuiz.mapImageUrl) {
        throw new Error("Localization map image is required.");
      }

      // Upload only new images
      const uploadResults = uploadTasks.length > 0 ? await Promise.all(uploadTasks) : [];

      // Build URL map from upload results
      let mainUrl = card.imageUrl; // default to existing
      const imageQuizUrls = card.imageQuiz.options.map(opt => opt.imageUrl); // default to existing
      const corrUrls = card.correlationQuiz.items.map(item => item.imageUrl); // default to existing
      let localizationMapUrl = card.localizationQuiz.mapImageUrl; // default to existing

      // Update with newly uploaded URLs
      for (let i = 0; i < uploadResults.length; i++) {
        const result = uploadResults[i];
        const mapping = uploadMap[i];

        if (mapping.type === "main") {
          mainUrl = result.url;
        } else if (mapping.type === "imageQuiz" && mapping.index !== undefined) {
          imageQuizUrls[mapping.index] = result.url;
        } else if (mapping.type === "correlation" && mapping.index !== undefined) {
          corrUrls[mapping.index] = result.url;
        } else if (mapping.type === "localizationMap") {
          localizationMapUrl = result.url;
        }
      }

      // monta card salvo com URLs reais
      const newCard: SavedCard = {
        ...card,
        orderIndex: i,
        id: editingCardId ?? generateId(),

        imageUrl: mainUrl, // URL real (existing or new)

        imageQuiz: {
          ...card.imageQuiz,
          options: card.imageQuiz.options.map((opt, k) => ({
            ...opt,
            imageUrl: imageQuizUrls[k] ?? opt.imageUrl, // URL real (existing or new)
          })),
        },

        correlationQuiz: {
          ...card.correlationQuiz,
          items: card.correlationQuiz.items.map((it, k) => ({
            ...it,
            imageUrl: corrUrls[k] ?? it.imageUrl, // URL real (existing or new)
          })),
        },

        localizationQuiz: {
          ...card.localizationQuiz,
          mapImageUrl: localizationMapUrl,
          mapImageFile: undefined,
          mapImagePreview: undefined,
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
    } catch (err: unknown) {
      setErrors((prev) => ({ ...prev, "assets.upload": err instanceof Error ? err.message : t("createTheme.errorUploadImages") }));
    } finally {
      setIsUploadingCard(false);
    }
  }

  /* ============================================================
   * 3) Save Theme: POST /themes com ThemeDto
   * ========================================================== */
  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const themeErrors = validateTheme();
    setErrors(themeErrors);
    if (Object.keys(themeErrors).length > 0) {
      setErrorModalErrors(themeErrors);
      setShowErrorModal(true);
      return;
    }

    if (!assetsSessionId) {
      setErrorModalErrors({ "assets.session": t("createTheme.errorUploadSession") });
      setShowErrorModal(true);
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
        const duplicatesStr = [...new Set(duplicates)].join(", ");
        setErrorModalErrors({ "cards.duplicate": t("createTheme.errorDuplicateCards", { duplicates: duplicatesStr }) });
        setShowErrorModal(true);
        return;
      }

      const payload = {
        name: themeName.trim(),
        resume: themeResume.trim(),
        recommendation: themeRecommendation.trim(),
        image: themeImageDataUrl!,      // dataUrl
        // Sempre envia sessionId para validação
        // Backend detecta se precisa promover baseado em session.ThemeId
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

          localizationQuiz: {
            mapImageUrl: withBaseUrl(c.localizationQuiz.mapImageUrl) ?? "",
            spots: c.localizationQuiz.spots,
          },
        })),
      };

      // Conditional: PUT for edit, POST for create
      if (isEditMode && editingThemeId) {
        await themesService.updateTheme(editingThemeId, payload as any);
        navigate("/my-themes");
      } else {
        await themesService.createTheme(payload as any);

        // Reset form only in CREATE mode
        nextOrderIndexRef.current = 0;
        setThemeName("");
        setThemeResume("");
        setThemeRecommendation("");
        setThemeImageDataUrl(null);
        setSavedCards([]);
        setEditingCardId(null);
        setCard(createEmptyCardDraft(0));
        setErrors({});

        navigate("/my-themes");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : t("createTheme.errorCreateTheme");
      setErrorModalErrors({ "create.theme": errorMsg });
      setShowErrorModal(true);
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
        <h1 className="create-theme-title">
          {isLoadingTheme
            ? t("createTheme.loading")
            : isEditMode
              ? t("createTheme.editTitle")
              : t("createTheme.title")
          }
        </h1>

        <form
          className="create-theme-form"
          onSubmit={onSubmit}
          style={{
            opacity: isLoadingTheme ? 0.6 : 1,
            pointerEvents: isLoadingTheme ? "none" : "auto"
          }}
        >
          {/* TOP ROW: name + resume + theme image */}
          <div className="theme-top-row">
            <label className="field theme-name-field">
              <h2 className="field-label">{t("createTheme.themeName")}</h2>
              <input
                className={["field-input", hasError("theme.name") ? "is-invalid" : ""].join(" ")}
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder={t("createTheme.themeNamePlaceholder")}
                maxLength={50}
              />
            </label>

            <label className="field theme-resume-field">
              <h2 className="field-label">{t("createTheme.resume")}</h2>
              <input
                className={["field-input", hasError("theme.resume") ? "is-invalid" : ""].join(" ")}
                value={themeResume}
                onChange={(e) => setThemeResume(e.target.value)}
                placeholder={t("createTheme.resumePlaceholder")}
                maxLength={100}
              />
            </label>

            <label className="field theme-recommendation-field">
              <h2 className="field-label">{t("createTheme.recommendation")}</h2>
              <CustomSelect
                className={hasError("theme.recommendation") ? "is-invalid" : ""}
                value={themeRecommendation}
                onChange={(value) => setThemeRecommendation(value)}
                options={[
                  { value: "", label: t("createTheme.selectAgeGroup") },
                  //{ value: "1º cicle: 6 - 10 years old", label: t("createTheme.cycle1") },
                  { value: "2º cicle: 10 - 12 years old", label: t("createTheme.cycle2") },
                  { value: "3º cicle: 12 - 15 years old", label: t("createTheme.cycle3") },
                  { value: "4º cicle: 15 - 18 years old", label: t("createTheme.cycle4") },
                ]}
              />
            </label>

            <div className="theme-image-field">
              <h2 className="field-label">{t("createTheme.themeImage")}</h2>

              <input
                ref={themeImageInputRef}
                type="file"
                accept="image/*"
                onChange={onThemeImageSelected}
                className="hidden-file"
              />

              <div
                className={["theme-image-wrap", hasError("theme.image") ? "is-invalid" : ""].join(" ")}
                onClick={onPickThemeImage}
                role="button"
                tabIndex={0}
                aria-label="Upload theme image"
              >
                <div className="theme-image-layer">
                  {themeImageDataUrl ? (
                    <img className="theme-image-preview" src={themeImageDataUrl} alt="Theme preview" />
                  ) : (
                    <div className="theme-image-placeholder">
                      <span>{t("createTheme.uploadCover")}</span>
                    </div>
                  )}
                </div>

                <img
                  src={themeFrameTemplate}
                  alt=""
                  className="theme-image-frame"
                  aria-hidden="true"
                />

                <div className="theme-image-overlay">
                  <span className="theme-image-overlay-text">{t("createTheme.uploadCover")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD BUILDER */}
          <section
            className="card-builder"
            style={{
              opacity: isCardBuilderDisabled ? 0.5 : 1,
              pointerEvents: isCardBuilderDisabled ? "none" : "auto",
              position: "relative"
            }}
          >
            <div className="card-builder-header">
              <h2 className="card-builder-title">
                {t("createTheme.addCard")}
                <span
                  className="info-icon"
                  data-tooltip={t("createTheme.cardInfo")}
                  aria-label="Informação"
                  role="img"
                >
                  ℹ
                </span>
              </h2>
              {isCardBuilderDisabled && (
                <div style={{
                  color: "#facc6b",
                  fontFamily: "'Marcellus', serif",
                  fontSize: "1.05rem",
                  marginTop: "0.5rem",
                  textAlign: "center"
                }}>
                  {t("createTheme.maxCardsReached", { max: MAX_SAVED_CARDS })}
                </div>
              )}
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
                      <div className="card-image-placeholder">{t("createTheme.clickToUpload")}</div>
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
                      const value = e.target.value.slice(0, 50);
                      setCard((prev) => ({ ...prev, caption: value }));
                    }}
                    placeholder={t("createTheme.eventNamePlaceholder")}
                    rows={4}
                  />
                </div>

                {/* Year + Era na mesma linha */}
                <div className="card-year-field">
                  <div className="year-era-row">
                    <label className="field-inline">
                      <span className="field-label">{t("createTheme.year")}</span>
                      <input
                        className={["field-input", "card-year-input", hasError("card.year") ? "is-invalid" : ""].join(" ")}
                        placeholder={t("createTheme.yearPlaceholder")}
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
                          checked={card.era === "BC"}
                          onChange={() => selectEra("BC")}
                        />
                        <span>{t("createTheme.eraBC")}</span>
                      </label>

                      <label className="era-option">
                        <input
                          type="checkbox"
                          checked={card.era === "AD"}
                          onChange={() => selectEra("AD")}
                        />
                        <span>{t("createTheme.eraAD")}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="create-card-button"
                  onClick={handleCreateCard}
                  disabled={isUploadingCard || isSessionLoading}
                >
                  {isUploadingCard ? t("createTheme.uploading") : editingCardId ? t("createTheme.updateCard") : t("createTheme.createCard")}
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
                    {t("createTheme.imageQuiz")}
                  </button>

                  <button
                    type="button"
                    className={["tab-btn", activeTab === "text-quiz" ? "active" : "", tabHasError("textQuiz") ? "tab-error" : ""].join(" ")}
                    onClick={() => setActiveTab("text-quiz")}
                  >
                    {t("createTheme.textQuiz")}
                  </button>

                  <button
                    type="button"
                    className={["tab-btn", activeTab === "trueOrFalse-quiz" ? "active" : "", tabHasError("tf") ? "tab-error" : ""].join(" ")}
                    onClick={() => setActiveTab("trueOrFalse-quiz")}
                  >
                    {t("createTheme.trueFalseQuiz")}
                  </button>

                  <button
                    type="button"
                    className={["tab-btn", activeTab === "correlation-quiz" ? "active" : "", tabHasError("corr") ? "tab-error" : ""].join(" ")}
                    onClick={() => setActiveTab("correlation-quiz")}
                  >
                    {t("createTheme.correlationQuiz")}
                  </button>

                  <button
                    type="button"
                    className={["tab-btn", activeTab === "localization" ? "active" : "", tabHasError("loc") ? "tab-error" : ""].join(" ")}
                    onClick={() => setActiveTab("localization")}
                  >
                    {t("createTheme.localizationTab")}
                  </button>
                </div>

                <div className="tabs-content">
                  {/* Image Quiz */}
                  {activeTab === "image-quiz" && (
                    <>
                      <label className="field field-inline">
                        <span className="field-label">{t("createTheme.question")}</span>
                        <input
                          className={["field-input", "quiz-question-input", hasError("imageQuiz.question") ? "is-invalid" : ""].join(" ")}
                          placeholder={t("createTheme.questionImagePlaceholder")}
                          value={card.imageQuiz.question}
                          onChange={(e) =>
                            setCard((prev) => ({
                              ...prev,
                              imageQuiz: { ...prev.imageQuiz, question: e.target.value },
                            }))
                          }
                          maxLength={70}
                        />
                      </label>

                      <div className="image-quiz-grid">
                        {card.imageQuiz.options.map((option, index) => (
                          <ImageQuizCard
                            key={`imageQuiz-option-${index}`}
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
                    </>
                  )}

                  {/* Text Quiz */}
                  {activeTab === "text-quiz" && (
                    <>
                      <label className="field field-inline">
                        <span className="field-label">{t("createTheme.question")}</span>
                        <input
                          className={["field-input", "quiz-question-input", hasError("textQuiz.question") ? "is-invalid" : ""].join(" ")}
                          placeholder={t("createTheme.questionTextPlaceholder")}
                          value={card.textQuiz.question}
                          onChange={(e) =>
                            setCard((prev) => ({
                              ...prev,
                              textQuiz: { ...prev.textQuiz, question: e.target.value },
                            }))
                          }
                          maxLength={70}
                        />
                      </label>

                      <div className="text-quiz-list">
                        {card.textQuiz.options.map((opt, index) => (
                          <div key={`textQuiz-option-${index}`} className="text-quiz-row">
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
                              placeholder={`${t("createTheme.option")} ${index + 1}`}
                              rows={2}
                              maxLength={150}
                            />
                          </div>
                        ))}
                      </div>
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
                          placeholder={t("createTheme.statementPlaceholder")}
                          rows={4}
                          maxLength={200}
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
                          <span>{t("createTheme.true")}</span>
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
                          <span>{t("createTheme.false")}</span>
                        </label>
                      </div>
                    </>
                  )}

                  {/* Correlation */}
                  {activeTab === "correlation-quiz" && (
                    <>
                      <div className="correlation-list">
                        {card.correlationQuiz.items.map((item, index) => (
                          <CorrelationRow
                            key={`correlation-item-${index}`}
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

                  {/* Localization */}
                  {activeTab === "localization" && (
                    <>
                      <div
                        ref={mapContainerRef}
                        className={[
                          "loc-map-viewer",
                          locIsDragging ? "dragging" : "",
                          card.localizationQuiz.spots.length < 4 ? "placing" : "",
                          hasError("loc.mapImage") ? "is-invalid" : "",
                        ].join(" ")}
                        onMouseDown={handleMapMouseDown}
                        onMouseMove={handleMapMouseMove}
                        onMouseUp={handleMapMouseUp}
                        onMouseLeave={handleMapMouseUp}
                        onClick={handleMapClick}
                      >
                        {/* Hidden reference image for natural dimensions */}
                        <img
                          ref={mapImgRef}
                          src={WORLD_MAP_URL}
                          crossOrigin="anonymous"
                          draggable={false}
                          alt=""
                          onLoad={handleMapImageLoad}
                          style={{ display: "none" }}
                        />
                        {/* Tiled map images for infinite horizontal scroll */}
                        {card.localizationQuiz.mapScale > 0 && mapImgRef.current && (() => {
                          const img = mapImgRef.current!;
                          const scale = card.localizationQuiz.mapScale;
                          const tileW = img.naturalWidth * scale;
                          const tileH = img.naturalHeight * scale;
                          const containerW = mapContainerRef.current?.clientWidth ?? 0;
                          const rawX = card.localizationQuiz.mapOffset.x;
                          const normX = ((rawX % tileW) + tileW) % tileW - tileW;
                          const tiles = [];
                          for (let x = normX, i = 0; x < containerW; x += tileW, i++) {
                            tiles.push(
                              <img
                                key={i}
                                src={WORLD_MAP_URL}
                                crossOrigin="anonymous"
                                draggable={false}
                                alt=""
                                style={{
                                  position: "absolute",
                                  left: x,
                                  top: card.localizationQuiz.mapOffset.y,
                                  width: tileW,
                                  height: tileH,
                                  pointerEvents: "none",
                                  userSelect: "none",
                                }}
                              />
                            );
                          }
                          return <>{tiles}</>;
                        })()}
                        {card.localizationQuiz.spots.map((spot, idx) => (
                          <div
                            key={idx}
                            className={["loc-spot", spot.isCorrect ? "loc-spot-correct" : "loc-spot-wrong"].join(" ")}
                            style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => handleRemoveSpot(idx, e)}
                            title={t("createTheme.localizationRemoveSpot")}
                          >
                            {idx + 1}
                          </div>
                        ))}
                      </div>

                      <div className="loc-controls">
                        <button type="button" className="loc-btn-secondary" onClick={resetLocalizationMap}>
                          {t("createTheme.localizationReset")}
                        </button>
                        <span className="loc-spots-count">
                          {t("createTheme.localizationSpotsPlaced", { count: card.localizationQuiz.spots.length })}
                        </span>
                        {card.localizationQuiz.spots.length > 0 && (
                          <button
                            type="button"
                            className="loc-btn-secondary"
                            onClick={() =>
                              setCard(prev => ({ ...prev, localizationQuiz: { ...prev.localizationQuiz, spots: [] } }))
                            }
                          >
                            {t("createTheme.localizationClearSpots")}
                          </button>
                        )}
                        <button
                          type="button"
                          className={["loc-btn-capture", card.localizationQuiz.mapImagePreview ? "captured" : ""].join(" ")}
                          onClick={captureMapArea}
                          disabled={card.localizationQuiz.spots.length === 0}
                        >
                          {card.localizationQuiz.mapImagePreview
                            ? t("createTheme.localizationRecapture")
                            : t("createTheme.localizationCapture")}
                        </button>
                      </div>

                      {card.localizationQuiz.spots.length > 0 && (
                        <div className={["loc-spots-list", hasError("loc.spots") || hasError("loc.correct") ? "is-invalid" : ""].join(" ")}>
                          {card.localizationQuiz.spots.map((spot, idx) => (
                            <label key={idx} className="loc-spot-row">
                              <input
                                type="radio"
                                name="loc-correct-spot"
                                checked={spot.isCorrect}
                                onChange={() => handleSetCorrectSpot(idx)}
                              />
                              <span className="loc-spot-label">
                                {t("createTheme.localizationSpot", { num: idx + 1 })}
                                <span className="loc-spot-coords">
                                  {" "}({(spot.x * 100).toFixed(1)}%, {(spot.y * 100).toFixed(1)}%)
                                </span>
                              </span>
                              <button
                                type="button"
                                className="loc-remove-spot"
                                onClick={(e) => handleRemoveSpot(idx, e)}
                              >
                                ×
                              </button>
                            </label>
                          ))}
                          <span className="loc-correct-hint">{t("createTheme.localizationCorrectHint")}</span>
                        </div>
                      )}

                      {card.localizationQuiz.mapImagePreview && (
                        <div className="loc-capture-preview">
                          <span className="loc-capture-label">{t("createTheme.localizationPreviewLabel")}</span>
                          <img src={card.localizationQuiz.mapImagePreview} className="loc-capture-img" alt="Captured map" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Added Cards */}
          <section className="added-cards-section">
            <h2 className="added-cards-title">
              {t("createTheme.addedCards")}
              <span
                className="info-icon"
                data-tooltip={t("createTheme.addedCardsInfo")}
                aria-label="Informação"
                role="img"
              >
                ℹ
              </span>
            </h2>

            <div className="added-cards-grid">
              {Array.from({ length: MAX_SAVED_CARDS }).map((_, i) => {
                const c = savedCards[i];
                const isFilled = Boolean(c);
                const isSelected = c?.id === selectedCardId;

                return (
                  <div key={c?.id ?? `card-slot-${i}`} className="added-card-wrapper">
                    <button
                      type="button"
                      className={[
                        "added-card-thumb",
                        isFilled ? "filled" : "empty",
                        isSelected ? "selected" : ""
                      ].filter(Boolean).join(" ")}
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
                          alt={`Card: ${c.caption || `Year ${c.year}`}`}
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
                          aria-label="Edit card"
                          data-tooltip="Edit card"
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
          </section>

          {/* Save Theme */}
          <div className="form-actions">
            <button
              className="primary-button"
              type="submit"
              disabled={!canSaveTheme || isCreatingTheme || isSessionLoading}
            >
              {isCreatingTheme
                ? (isEditMode ? t("createTheme.updating") : t("createTheme.saving"))
                : (isEditMode ? t("createTheme.updateTheme") : t("createTheme.saveTheme"))
              }
            </button>
          </div>
        </form>
      </main>

      <ErrorModal
        isOpen={showErrorModal}
        errors={errorModalErrors}
        onClose={() => setShowErrorModal(false)}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title={t("createTheme.deleteCardTitle")}
        message={t("createTheme.deleteCardMessage")}
        onConfirm={confirmDeleteCard}
        onCancel={cancelDeleteCard}
        confirmText={t("createTheme.deleteCardConfirm")}
        cancelText={t("createTheme.deleteCardCancel")}
      />
    </div>
  );
}
