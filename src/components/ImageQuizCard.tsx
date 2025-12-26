import { useRef, type ChangeEvent } from "react";
import imageTemplate from "../assets/imageTemplate.png";

type ImageQuizCardProps = {
  index: number;
  imageDataUrl?: string;
  onImageSelected: (index: number, file: File) => void;
  checked: boolean;
  onSelectCorrect: (index: number) => void;
  invalidFrame?: boolean;
  invalidCheckbox?: boolean
};

export function ImageQuizCard({
  index,
  imageDataUrl,
  onImageSelected,
  checked,
  onSelectCorrect,
  invalidFrame,
  invalidCheckbox
}: ImageQuizCardProps) {
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
    <div className="image-quiz-item">
      <div  className="image-quiz-card">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden-file"
          onChange={onChange}
        />

        <button
          type="button"
          className="image-quiz-hitbox"
          onClick={onPick}
          aria-label={`Upload imagem opção ${index + 1}`}
        >
          {imageDataUrl ? (
            <img
              src={imageDataUrl}
              alt={`Opção ${index + 1}`}
              className="image-quiz-user-image"
            />
          ) : (
            <div className="image-quiz-placeholder">CLICK TO UPLOAD IMAGE</div>
          )}
        </button>

        <img
          src={imageTemplate}
          alt="Template da opção"
          className={[
            "image-quiz-frame",
            invalidFrame ? "is-invalid-frame" : "",
          ].join(" ")}
        />
      </div>

      <label className="image-quiz-correct">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onSelectCorrect(index)}
          className={invalidCheckbox ? "is-invalid-checkbox" : ""}
        />
        <span>Correct</span>
      </label>

    </div>
  );
}
