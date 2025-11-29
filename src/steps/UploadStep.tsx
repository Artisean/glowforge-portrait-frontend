import type React from "react";
import { useEffect } from "react";
import { useAiAnalysis } from "../hooks/useAiAnalysis";
import { useWizard } from "../contexts/WizardContext";
import { StepShell } from "../components/layout/StepShell";
import { getStepNumber, TOTAL_STEPS } from "../lib/wizardConfig";
import { AiAnalysisSummaryCard } from "../components/ai/AiAnalysisSummaryCard";

const STEP_NUMBER = getStepNumber("upload");

export function UploadStep() {
  const {
    imageWorking,
    setOriginalImage,
    setWorkingImage,
    analysis,
    setAnalysis,
    goNext,
  } = useWizard();
  const { loading, result, error, runAnalysis } = useAiAnalysis();

  useEffect(() => {
    if (result && result.success) {
      setAnalysis(result.analysis);
    } else if (result && !result.success) {
      setAnalysis(null);
    }
  }, [result, setAnalysis]);

  const backendError =
    result && !result.success ? result.error : null;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setOriginalImage(null);
      setWorkingImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const next = reader.result;
      if (typeof next === "string") {
        setOriginalImage(next);
        setWorkingImage(next);
      } else {
        setOriginalImage(null);
        setWorkingImage(null);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleClear() {
    setOriginalImage(null);
    setWorkingImage(null);
    setAnalysis(null);
  }

  function handleAnalyze() {
    return runAnalysis(
      imageWorking ?? "data:image/png;base64,stub",
      { profile: "portrait" }
    );
  }

  const previewContent = imageWorking ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        padding: "1rem",
        border: "1px solid #444",
        borderRadius: "0.75rem",
        background: "#0f0f0f",
      }}
    >
      <div style={{ opacity: 0.8 }}>Preview</div>
      <img
        src={imageWorking}
        alt="Uploaded preview"
        style={{
          maxWidth: "100%",
          maxHeight: "320px",
          objectFit: "contain",
          borderRadius: "0.75rem",
          border: "1px solid #444",
          background: "#000",
        }}
      />
    </div>
  ) : (
    <div
      style={{
        padding: "1rem",
        border: "1px dashed #444",
        borderRadius: "0.75rem",
        background: "#0f0f0f",
      }}
    >
      No image yet. Upload a photo to begin.
    </div>
  );

  const controlsContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div>
        <p style={{ margin: 0 }}>
          Select a photo to begin. The image will be loaded into the wizard as a
          data URL for further processing (crop, B/W, dodge and burn, etc.).
        </p>
        <div style={{ marginTop: "0.75rem" }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {imageWorking && (
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
      </div>

      <div
        style={{
          marginTop: "0.5rem",
          padding: "0.75rem",
          borderRadius: "0.75rem",
          border: "1px solid #333",
          background: "#131313",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Analyze Photo (Backend Stub)</h4>
        <p style={{ opacity: 0.8, margin: 0 }}>
          Calls the backend <code>ai-analyze-photo</code> endpoint using the
          uploaded image (or a stub if none is selected), then shows a summary
          of the suggested engraving prep.
        </p>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            background: "#fff",
            color: "#111",
            fontWeight: 600,
          }}
        >
          {loading ? "Analyzing..." : "Analyze photo"}
        </button>

        {error && (
          <pre
            style={{
              marginTop: "0.75rem",
              padding: "0.75rem",
              border: "1px solid #f99",
              background: "#311",
              color: "#fdd",
              whiteSpace: "pre-wrap",
            }}
          >
            Error: {error}
          </pre>
        )}

        {backendError && (
          <pre
            style={{
              marginTop: "0.75rem",
              padding: "0.75rem",
              border: "1px solid #f99",
              background: "#311",
              color: "#fdd",
              whiteSpace: "pre-wrap",
            }}
          >
            Backend error ({backendError.code}): {backendError.message}
          </pre>
        )}

        <AiAnalysisSummaryCard analysis={analysis} />
        {!analysis && (error || backendError) && (
          <div style={{ marginTop: "0.25rem", opacity: 0.8 }}>
            We couldn’t load AI hints this time. You can still proceed manually and run a
            small test engraving on scrap.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <StepShell
      stepNumber={STEP_NUMBER}
      totalSteps={TOTAL_STEPS}
      title="Upload & Prep"
      subtitle="Load your photo into the wizard so later steps can refine it."
      preview={previewContent}
      controls={controlsContent}
      onContinue={goNext}
      continueLabel="Continue"
      continueDisabled={loading}
    />
  );
}
