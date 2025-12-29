import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import "./PrivacyPolicyPage.css";

import enContent from "../content/privacy-policy/en.md?raw";
import ptBrContent from "../content/privacy-policy/pt-br.md?raw";
import ptPtContent from "../content/privacy-policy/pt-pt.md?raw";
import frContent from "../content/privacy-policy/fr.md?raw";
import esContent from "../content/privacy-policy/es.md?raw";

const contentByLanguage: Record<string, string> = {
  en: enContent,
  "pt-BR": ptBrContent,
  "pt-PT": ptPtContent,
  fr: frContent,
  es: esContent,
};

function getContentForLanguage(lang: string): string {
  // Try exact match first
  if (contentByLanguage[lang]) {
    return contentByLanguage[lang];
  }
  // Try base language (e.g., "pt" -> "pt-BR")
  const baseLang = lang.split("-")[0];
  if (baseLang === "pt") {
    return contentByLanguage["pt-BR"];
  }
  if (contentByLanguage[baseLang]) {
    return contentByLanguage[baseLang];
  }
  // Default to English
  return contentByLanguage.en;
}

export function PrivacyPolicyPage() {
  const { i18n } = useTranslation();
  const [content, setContent] = useState("");

  useEffect(() => {
    setContent(getContentForLanguage(i18n.language));
  }, [i18n.language]);

  return (
    <div className="privacy-policy-page">
      <div className="privacy-policy-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
