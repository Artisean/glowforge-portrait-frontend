import { useWizard } from "../contexts/WizardContext";
import { StepShell } from "../components/layout/StepShell";
import { getStepNumber, TOTAL_STEPS } from "../lib/wizardConfig";

const STEP_NUMBER = getStepNumber("halftone");

export function HalftoneStep() {
  const { imageWorking, analysis, goNext, goPrev } = useWizard();
  const hasImage = Boolean(imageWorking);

  const previewContent = hasImage ? (
    <div
      style={{
        padding: "1rem",
        border: "1px solid #444",
        borderRadius: "0.75rem",
        background: "#0f0f0f",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        alignItems: "center",
      }}
    >
      <strong>Halftone preview (placeholder)</strong>
      <img
        src={imageWorking ?? ""}
        alt="Current image for halftone"
        style={{
          maxWidth: "100%",
          maxHeight: "320px",
          objectFit: "contain",
          borderRadius: "0.75rem",
          border: "1px solid #444",
          background: "#000",
        }}
      />
      <div style={{ opacity: 0.8, fontSize: "0.9rem" }}>
        Future versions will apply engraving-aware halftone settings.
      </div>
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
      Upload a photo in Step 1 and apply prior steps before halftoning.
    </div>
  );

  const controlsContent = (
    <div
      style={{
        border: "1px solid #444",
        borderRadius: "0.75rem",
        padding: "0.75rem",
        background: "#0f0f0f",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <p style={{ margin: 0 }}>
        Placeholder controls for halftone conversion. AI suggestions for LPI,
        angle, and shape will surface here when available.
      </p>
      {analysis?.halftone && (
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem",
            borderRadius: "0.5rem",
            border: "1px solid #333",
            background: "#131313",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
            Suggested halftone (from analysis)
          </div>
          <div style={{ opacity: 0.9 }}>
            {analysis.halftone.outputDpi} dpi, {analysis.halftone.lpi} LPI,
            angle {analysis.halftone.angleDeg} deg, shape "
            {String(analysis.halftone.shape)}"
          </div>
        </div>
      )}
    </div>
  );

  return (
    <StepShell
      stepNumber={STEP_NUMBER}
      totalSteps={TOTAL_STEPS}
      title="Halftone"
      subtitle="Apply engraving-aware halftone settings before export."
      preview={previewContent}
      controls={controlsContent}
      onBack={goPrev}
      onContinue={goNext}
      continueLabel="Continue"
      continueDisabled={!hasImage}
    />
  );
}
