import { useWizard } from "../contexts/WizardContext";
import { StepShell } from "../components/layout/StepShell";
import { getStepNumber, TOTAL_STEPS } from "../lib/wizardConfig";

const STEP_NUMBER = getStepNumber("export");

export function ExportStep() {
  const { imageWorking, analysis, goPrev, goNext } = useWizard();
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
      <strong>Export preview (placeholder)</strong>
      <img
        src={imageWorking ?? ""}
        alt="Final image ready for export"
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
        Final checks before downloading your Glowforge-ready file.
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
      Upload and process a photo before exporting.
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
        Placeholder export panel. Future updates will offer download options and
        preset engrave settings.
      </p>
      {analysis?.recommendedEngraveSettings && (
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
            Recommended engrave settings
          </div>
          <div style={{ opacity: 0.9 }}>
            Speed {analysis.recommendedEngraveSettings.speed}, power{" "}
            {analysis.recommendedEngraveSettings.power},{" "}
            {analysis.recommendedEngraveSettings.lpi} LPI,{" "}
            {analysis.recommendedEngraveSettings.passes} pass
            {analysis.recommendedEngraveSettings.passes !== 1 ? "es" : ""},{" "}
            focus {analysis.recommendedEngraveSettings.focus}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <StepShell
      stepNumber={STEP_NUMBER}
      totalSteps={TOTAL_STEPS}
      title="Export"
      subtitle="Review and download your Glowforge-ready file."
      preview={previewContent}
      controls={controlsContent}
      onBack={goPrev}
      onContinue={goNext}
      continueLabel="Finish"
      continueDisabled={!hasImage}
    />
  );
}
