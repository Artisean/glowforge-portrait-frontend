import type React from "react";
import { useEffect } from "react";
import { useAiAnalysis } from "../hooks/useAiAnalysis";
import { useWizard } from "../contexts/WizardContext";
import { StepShell } from "../components/layout/StepShell";
import { getStepNumber, TOTAL_STEPS } from "../lib/wizardConfig";
import { type AiAnalysisResult } from "../lib/api";

const STEP_NUMBER = getStepNumber("upload");

function AnalysisSummary({ analysis }: { analysis: AiAnalysisResult }) {
  const {
    notes,
    halftone,
    highlightWarning,
    shadowWarning,
    dotGainRisk,
    recommendedEngraveSettings,
  } = analysis;

  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "1rem",
        borderRadius: "0.75rem",
        border: "1px solid #444",
        background: "#151515",
        textAlign: "left",
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
        Analysis summary
      </h4>

      {Array.isArray(notes) && notes.length > 0 && (
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
            Notes:
          </div>
          <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
            {notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {halftone && (
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontWeight: 600 }}>Halftone suggestion:</div>
          <div>
            {halftone.outputDpi} dpi, {halftone.lpi} LPI, angle{" "}
            {halftone.angleDeg} deg, shape "{String(halftone.shape)}"
          </div>
        </div>
      )}

      {(highlightWarning?.hasIssue || shadowWarning?.hasIssue) && (
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontWeight: 600 }}>Warnings:</div>
          <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
            {highlightWarning?.hasIssue && (
              <li>{highlightWarning.message}</li>
            )}
            {shadowWarning?.hasIssue && <li>{shadowWarning.message}</li>}
          </ul>
        </div>
      )}

      {dotGainRisk && (
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontWeight: 600 }}>Dot gain risk:</div>
          <div>
            Level: {dotGainRisk.level} - {dotGainRisk.message}
          </div>
        </div>
      )}

      {recommendedEngraveSettings && (
        <div>
          <div style={{ fontWeight: 600 }}>Recommended engrave settings:</div>
          <div>
            Speed {recommendedEngraveSettings.speed}, power{" "}
            {recommendedEngraveSettings.power}, {recommendedEngraveSettings.lpi}{" "}
            LPI, {recommendedEngraveSettings.passes} pass
            {recommendedEngraveSettings.passes !== 1 ? "es" : ""},{" "}
            focus {recommendedEngraveSettings.focus}
          </div>
        </div>
      )}
    </div>
  );
}

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

        {analysis && <AnalysisSummary analysis={analysis} />}
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
