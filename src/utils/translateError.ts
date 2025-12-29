import i18n from "../i18n";
import { ApiError } from "../services/api";

export function translateError(error: unknown): string {
  if (error instanceof ApiError && error.code) {
    const translated = i18n.t(`errors.${error.code}`);
    // If translation key doesn't exist, i18n returns the key itself
    if (translated !== `errors.${error.code}`) {
      return translated;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return i18n.t("errors.UNKNOWN");
}
