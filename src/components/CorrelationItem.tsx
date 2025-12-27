import { useRef, type ChangeEvent } from "react";
import imageTemplate from "../assets/imageTemplate.png";

type CorrelationRowProps = {
  index: number;
  imageDataUrl?: string;
  text: string;
  onImageSelected: (index: number, file: File) => void;
  onTextChange: (value: string) => void;
  invalidImage?: boolean; 
  invalidText?: boolean
};

export function CorrelationRow({
  index,
  imageDataUrl,
  text,
  onImageSelected,
  onTextChange,
  invalidImage,
  invalidText
}: CorrelationRowProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function onPick() {
    inputRef.current?.click();
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageSelected(index, file);
    e.target.value = "";
  }

  return (
    <div className="correlation-row">
      <div className="correlation-card">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden-file"
          onChange={onChange}
        />

        <button
          type="button"
          className="correlation-hitbox"
          onClick={onPick}
          aria-label={`Upload imagem correlação ${index + 1}`}
        >
          {imageDataUrl ? (
            <img
              className="correlation-user-image"
              src={imageDataUrl}
              alt={`Figura ${index + 1}`}
            />
          ) : (
            <div className="correlation-placeholder">CLICK TO UPLOAD IMAGE</div>
          )}
        </button>

        <img
          className={[
            "correlation-frame",
            invalidImage ? "is-invalid-frame" : "",
          ].join(" ")}
          src={imageTemplate}
          alt="Template"
        />
      </div>

      <textarea
        className={[
          "correlation-textarea",
          invalidText ? "is-invalid" : "",
        ].join(" ")}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={`Text ${index + 1}`}
        rows={3}
        maxLength={150}
      />
    </div>
  );
}
