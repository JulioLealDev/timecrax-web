import { useState, useEffect, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import "./PrivacyPolicyPage.css";

const ReactMarkdown = lazy(() => import("react-markdown"));

import enContent from "../content/privacy-policy/en.md?raw";
import ptBrContent from "../content/privacy-policy/pt-br.md?raw";
import ptPtContent from "../content/privacy-policy/pt-pt.md?raw";
import frContent from "../content/privacy-policy/fr.md?raw";
import esContent from "../content/privacy-policy/es.md?raw";

const contentByLanguage: Record<string, string> = {
  en: enContent,
  pt_br: ptBrContent,
  pt_pt: ptPtContent,
  fr: frContent,
  es: esContent,
};

function getContentForLanguage(lang: string): string {
  // Try exact match first
  if (contentByLanguage[lang]) {
    return contentByLanguage[lang];
  }
  // Try base language fallback (e.g., "pt" -> "pt_br")
  const baseLang = lang.split("_")[0];
  if (baseLang === "pt") {
    return contentByLanguage.pt_br;
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
        <Suspense fallback={<div>Loading...</div>}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </Suspense>
      </div>
    </div>
  );
}
