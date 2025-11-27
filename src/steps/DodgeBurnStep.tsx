import { useWizard } from "../contexts/WizardContext";
import { StepShell } from "../components/layout/StepShell";
import { getStepNumber, TOTAL_STEPS } from "../lib/wizardConfig";

const STEP_NUMBER = getStepNumber("dodgeBurn");

export function DodgeBurnStep() {
  const { imageWorking, goNext, goPrev } = useWizard();
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
      <strong>Dodge & Burn preview (placeholder)</strong>
      <img
        src={imageWorking ?? ""}
        alt="Current image for dodge & burn"
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
        Future versions will let you paint local light/dark adjustments.
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
      Upload a photo in Step 1 and apply B/W before dodge and burn.
    </div>
  );

  const controlsContent = (
    <div
      style={{
        border: "1px solid #444",
        borderRadius: "0.75rem",
        padding: "0.75rem",
        background: "#0f0f0f",
      }}
    >
      <p style={{ margin: 0 }}>
        Placeholder controls for local light/dark adjustments. A future update
        will add brush settings, mask painting, and feathering controls.
      </p>
    </div>
  );

  return (
    <StepShell
      stepNumber={STEP_NUMBER}
      totalSteps={TOTAL_STEPS}
      title="Dodge & Burn"
      subtitle="Shape local contrast to emphasize features."
      preview={previewContent}
      controls={controlsContent}
      onBack={goPrev}
      onContinue={goNext}
      continueLabel="Continue"
      continueDisabled={!hasImage}
    />
  );
}
