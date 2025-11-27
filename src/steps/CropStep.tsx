import { useWizard } from "../contexts/WizardContext";
import { StepShell } from "../components/layout/StepShell";
import { getStepNumber, TOTAL_STEPS } from "../lib/wizardConfig";

const STEP_NUMBER = getStepNumber("crop");

export function CropStep() {
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
      <strong>Crop preview (placeholder)</strong>
      <img
        src={imageWorking ?? ""}
        alt="Current image for cropping"
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
        Future versions will let you set aspect ratios and crop boxes.
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
      Upload a photo in Step 1 and apply B/W before cropping.
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
        Placeholder controls for cropping and framing the subject. Future
        updates will include crop handles, aspect ratios, and rule-of-thirds
        guides.
      </p>
    </div>
  );

  return (
    <StepShell
      stepNumber={STEP_NUMBER}
      totalSteps={TOTAL_STEPS}
      title="Crop"
      subtitle="Frame your portrait before tonal adjustments."
      preview={previewContent}
      controls={controlsContent}
      onBack={goPrev}
      onContinue={goNext}
      continueLabel="Continue"
      continueDisabled={!hasImage}
    />
  );
}
