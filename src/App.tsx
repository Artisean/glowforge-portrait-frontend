import "./App.css";
import { WizardProvider, useWizard } from "./contexts/WizardContext";
import { STEPS } from "./lib/wizardConfig";
import { BlackAndWhiteStep } from "./steps/BlackAndWhiteStep";
import { UploadStep } from "./steps/UploadStep";
import { CropStep } from "./steps/CropStep";
import { DodgeBurnStep } from "./steps/DodgeBurnStep";
import { LevelsCurvesStep } from "./steps/LevelsCurvesStep";
import { HalftoneStep } from "./steps/HalftoneStep";
import { ExportStep } from "./steps/ExportStep";

function WizardContent() {
  const { currentStepId, setCurrentStepId, goNext, goPrev } = useWizard();
  const currentIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.id === currentStepId)
  );

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
        <h1>Glowforge Portrait Engraver - Frontend</h1>
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
              onClick={() => setCurrentStepId(step.id)}
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

      <main
        style={{
          flex: 1,
          maxWidth: "960px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {renderStepContent()}
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
          Previous
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
          Next
        </button>
      </footer>
    </div>
  );
}

function App() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}

export default App;
