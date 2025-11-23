import type React from "react";

interface UploadStepProps {
  imageDataUrl: string | null;
  onImageDataUrlChange: (dataUrl: string | null) => void;
}

export function UploadStep({
  imageDataUrl,
  onImageDataUrlChange,
}: UploadStepProps) {
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      onImageDataUrlChange(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        onImageDataUrlChange(result);
      } else {
        onImageDataUrlChange(null);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleClear() {
    onImageDataUrlChange(null);
  }

  return (
    <section>
      <h2>Step 1 – Upload &amp; Prep</h2>
      <p>
        Select a photo to begin. The image will be loaded into the wizard as a
        data URL for further processing (crop, B/W, dodge &amp; burn, etc.).
      </p>

      <div style={{ marginTop: "1rem" }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {imageDataUrl && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              marginLeft: "0.75rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              border: "1px solid #555",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Clear image
          </button>
        )}
      </div>

      {imageDataUrl && (
        <div
          style={{
            marginTop: "1.5rem",
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div style={{ opacity: 0.8 }}>Preview:</div>
          <img
            src={imageDataUrl}
            alt="Uploaded preview"
            style={{
              maxWidth: "400px",
              maxHeight: "300px",
              objectFit: "contain",
              borderRadius: "0.75rem",
              border: "1px solid #444",
              background: "#000",
            }}
          />
        </div>
      )}
    </section>
  );
}
