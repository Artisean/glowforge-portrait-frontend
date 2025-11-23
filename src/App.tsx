import { useState } from "react";
import "./App.css";
import {
  aiAnalyzePhoto,
  type AiAnalyzePhotoResponse,
} from "./lib/api";
import { UploadStep } from "./steps/UploadStep";
import { CropStep } from "./steps/CropStep";
import { BlackAndWhiteStep } from "./steps/BlackAndWhiteStep";
import { DodgeBurnStep } from "./steps/DodgeBurnStep";
import { LevelsCurvesStep } from "./steps/LevelsCurvesStep";
import { HalftoneStep } from "./steps/HalftoneStep";
import { ExportStep } from "./steps/ExportStep";

type StepId =
  | "upload"
  | "crop"
  | "blackAndWhite"
  | "dodgeBurn"
  | "levelsCurves"
  | "halftone"
  | "export";

interface StepConfig {
  id: StepId;
  label: string;
}

const STEPS: StepConfig[] = [
  { id: "upload", label: "1. Upload & Prep" },
  { id: "crop", label: "2. Crop" },
  { id: "blackAndWhite", label: "3. Black & White" },
  { id: "dodgeBurn", label: "4. Dodge & Burn" },
  { id: "levelsCurves", label: "5. Levels & Curves" },
  { id: "halftone", label: "6. Halftone" },
  { id: "export", label: "7. Export" },
];

function App() {
  const [currentStepId, setCurrentStepId] = useState<StepId>("upload");
  const currentIndex = STEPS.findIndex((s) => s.id === currentStepId);

  // Backend test harness state (still useful while we build UI)
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiAnalyzePhotoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function goToStep(stepId: StepId) {
    setCurrentStepId(stepId);
  }

  function goNext() {
    if (currentIndex < STEPS.length - 1) {
      setCurrentStepId(STEPS[currentIndex + 1].id);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentStepId(STEPS[currentIndex - 1].id);
    }
  }

  async function handleTestClick() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Dummy data URL – backend only checks that it's a non-empty string.
      const response = await aiAnalyzePhoto(
        "data:image/png;base64,stub",
        { profile: "portrait" }
      );

      setResult(response);
      console.log("aiAnalyzePhoto response:", response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("aiAnalyzePhoto error:", err);
    } finally {
      setLoading(false);
    }
  }

  function renderStepContent() {
    switch (currentStepId) {
      case "upload":
        return <UploadStep />;
      case "crop":
        return <CropStep />;
      case "blackAndWhite":
        return <BlackAndWhiteStep />;
      case "dodgeBurn":
        return <DodgeBurnStep />;
      case "levelsCurves":
        return <LevelsCurvesStep />;
      case "halftone":
        return <HalftoneStep />;
      case "export":
        return <ExportStep />;
      default:
        return null;
    }
  }

  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      <header style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <h1>Glowforge Portrait Engraver – Frontend</h1>
        <p style={{ opacity: 0.8 }}>
          Multi-step wizard for preparing photos for laser engraving on wood.
        </p>
      </header>

      <nav
        aria-label="Wizard steps"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {STEPS.map((step, index) => {
          const isActive = step.id === currentStepId;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => goToStep(step.id)}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "999px",
                border: isActive ? "2px solid #fff" : "1px solid #555",
                background: isActive ? "#fff" : "transparent",
                color: isActive ? "#111" : "#fff",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {index + 1}. {step.label.replace(/^\d+\.\s*/, "")}
            </button>
          );
        })}
      </nav>

      <main style={{ flex: 1, maxWidth: "960px", margin: "0 auto", width: "100%" }}>
        {renderStepContent()}

        {currentStepId === "upload" && (
          <section style={{ marginTop: "2rem" }}>
            <h3>Developer Backend Test</h3>
            <p style={{ opacity: 0.8 }}>
              Temporary harness to call the backend <code>ai-analyze-photo</code> stub.
            </p>
            <button
              type="button"
              onClick={handleTestClick}
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
              {loading ? "Calling backend…" : "Test aiAnalyzePhoto"}
            </button>

            {error && (
              <pre
                style={{
                  marginTop: "1rem",
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

            {result && (
              <pre
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  border: "1px solid #444",
                  background: "#111",
                  color: "#ddd",
                  maxHeight: "300px",
                  overflow: "auto",
                  textAlign: "left",
                }}
              >
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </section>
        )}
      </main>

      <footer
        style={{
          marginTop: "2rem",
          display: "flex",
          justifyContent: "space-between",
          maxWidth: "960px",
          width: "100%",
          marginInline: "auto",
        }}
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={currentIndex <= 0}
          style={{
            opacity: currentIndex <= 0 ? 0.5 : 1,
            cursor: currentIndex <= 0 ? "default" : "pointer",
          }}
        >
          ← Previous
        </button>
        <span>
          Step {currentIndex + 1} of {STEPS.length}
        </span>
        <button
          type="button"
          onClick={goNext}
          disabled={currentIndex >= STEPS.length - 1}
          style={{
            opacity: currentIndex >= STEPS.length - 1 ? 0.5 : 1,
            cursor: currentIndex >= STEPS.length - 1 ? "default" : "pointer",
          }}
        >
          Next →
        </button>
      </footer>
    </div>
  );
}

export default App;
