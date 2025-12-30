import { useState, useEffect, useRef } from "react";
import "./CustomSelect.css";

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
};

const DEFAULT_PLACEHOLDER = "Select...";

export function CustomSelect({ value, onChange, options, disabled, className, placeholder = DEFAULT_PLACEHOLDER }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setIsOpen(false);
  }

  return (
    <div className={`custom-select ${className || ""}`} ref={dropdownRef}>
      <button
        type="button"
        className={`custom-select-button ${isOpen ? "open" : ""}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
      >
        <span className="custom-select-value">{selectedOption?.label || placeholder}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" className="custom-select-arrow">
          <path fill="currentColor" d="M1.41 0L6 4.58 10.59 0 12 1.42l-6 6-6-6z" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="custom-select-menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`custom-select-option ${option.value === value ? "selected" : ""}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
