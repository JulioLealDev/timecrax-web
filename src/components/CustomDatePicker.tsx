import { forwardRef, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { useTranslation } from "react-i18next";
import { ptBR } from "date-fns/locale/pt-BR";
import { pt } from "date-fns/locale/pt";
import { fr } from "date-fns/locale/fr";
import { es } from "date-fns/locale/es";
import { enUS } from "date-fns/locale/en-US";
import "react-datepicker/dist/react-datepicker.css";
import "./CustomDatePicker.css";

// Register locales
registerLocale("pt-BR", ptBR);
registerLocale("pt-PT", pt);
registerLocale("fr", fr);
registerLocale("es", es);
registerLocale("en", enUS);

type CustomDatePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  maxDate?: Date;
  minDate?: Date;
  disabled?: boolean;
  placeholder?: string;
};

type CustomInputProps = {
  value?: string;
  onClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  onManualChange?: (value: string) => void;
};

// Format input as dd/mm/yyyy while typing
function formatDateInput(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, "");

  // Build formatted string
  let formatted = "";
  for (let i = 0; i < digits.length && i < 8; i++) {
    if (i === 2 || i === 4) {
      formatted += "/";
    }
    formatted += digits[i];
  }

  return formatted;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, onBlur, placeholder: _placeholder, disabled, onManualChange }, ref) => {
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // Sync with external value when not focused
    // Ensure empty value shows placeholder
    const externalValue = value || "";
    const displayValue = isFocused ? inputValue : externalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatDateInput(e.target.value);
      setInputValue(formatted);
      onManualChange?.(formatted);
    };

    const handleFocus = () => {
      setIsFocused(true);
      setInputValue(externalValue);
    };

    const handleBlur = () => {
      setIsFocused(false);
      setInputValue("");
      onBlur?.();
    };

    return (
      <div className="custom-datepicker-input-wrapper">
        <input
          type="text"
          className="custom-datepicker-input"
          value={displayValue}
          onClick={onClick}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="dd/mm/yyyy"
          disabled={disabled}
          ref={ref}
          maxLength={10}
        />
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="custom-datepicker-icon"
          onClick={disabled ? undefined : onClick}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

// Parse dd/mm/yyyy string to Date
function parseDateString(dateStr: string): Date | null {
  if (dateStr.length !== 10) return null;

  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) return null;

  const date = new Date(year, month, day);

  // Validate the date is real (e.g., not 31/02/2000)
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null;
  }

  return date;
}

export function CustomDatePicker({
  value,
  onChange,
  maxDate,
  minDate,
  disabled,
  placeholder: _placeholder,
}: CustomDatePickerProps) {
  const { i18n } = useTranslation();

  const getLocale = () => {
    const lang = i18n.language;
    if (lang.startsWith("pt-BR") || lang === "pt") return "pt-BR";
    if (lang.startsWith("pt-PT")) return "pt-PT";
    if (lang.startsWith("fr")) return "fr";
    if (lang.startsWith("es")) return "es";
    return "en";
  };

  const handleManualChange = (formatted: string) => {
    if (formatted.length === 10) {
      const parsedDate = parseDateString(formatted);
      if (parsedDate) {
        // Check against maxDate/minDate
        if (maxDate && parsedDate > maxDate) return;
        if (minDate && parsedDate < minDate) return;
        onChange(parsedDate);
      }
    }
  };

  return (
    <div className="custom-datepicker">
      <DatePicker
        selected={value}
        onChange={onChange}
        maxDate={maxDate}
        minDate={minDate}
        disabled={disabled}
        locale={getLocale()}
        dateFormat="dd/MM/yyyy"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        yearDropdownItemNumber={100}
        scrollableYearDropdown
        customInput={
          <CustomInput
            placeholder="dd/mm/yyyy"
            disabled={disabled}
            onManualChange={handleManualChange}
          />
        }
        popperClassName="custom-datepicker-popper"
        calendarClassName="custom-datepicker-calendar"
        showPopperArrow={false}
      />
    </div>
  );
}
