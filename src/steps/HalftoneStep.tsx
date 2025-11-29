import { useState } from "react";
import { useWizard } from "../contexts/WizardContext";
import { StepShell } from "../components/layout/StepShell";
import { getStepNumber, TOTAL_STEPS } from "../lib/wizardConfig";
import { AiHalftoneHintsCard } from "../components/ai/AiHalftoneHintsCard";

const STEP_NUMBER = getStepNumber("halftone");

type HalftoneSettings = {
  outputDpi?: number;
  lpi?: number;
  angleDeg?: number;
  shape?: "round" | "line" | "square" | "ellipse" | string;
};

const DEFAULT_HALFTONE: HalftoneSettings = {
  outputDpi: 320,
  lpi: 80,
  angleDeg: -35,
  shape: "line",
};

export function HalftoneStep() {
  const {
    imageWorking,
    analysis,
    halftoneSettings,
    setHalftoneSettings,
    goNext,
    goPrev,
  } = useWizard();
  const hasImage = Boolean(imageWorking);

  const [settings, setSettings] = useState<HalftoneSettings>(() => {
    if (halftoneSettings) return halftoneSettings;
    if (analysis?.halftone) {
      return {
        outputDpi: analysis.halftone.outputDpi,
        lpi: analysis.halftone.lpi,
        angleDeg: analysis.halftone.angleDeg,
        shape: analysis.halftone.shape,
      };
    }
    return DEFAULT_HALFTONE;
  });

  function handleChange<K extends keyof HalftoneSettings>(
    key: K,
    value: number | string
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handlePreset(value: HalftoneSettings) {
    setSettings(value);
  }

  function handleContinue() {
    setHalftoneSettings(settings);
    goNext();
  }

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
      <strong>Preview (B/W before halftone)</strong>
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
        Halftone rendering is coming soon. Adjust settings below and continue.
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
      You’ll see a preview here after completing earlier steps.
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
        gap: "0.75rem",
      }}
    >
      <strong>Halftone parameters</strong>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <span style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Output DPI</span>
          <span style={{ opacity: 0.8 }}>{settings.outputDpi ?? ""}</span>
        </span>
        <input
          type="number"
          min={150}
          max={600}
          value={settings.outputDpi ?? ""}
          onChange={(e) => handleChange("outputDpi", Number(e.target.value))}
          disabled={!hasImage}
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <span style={{ display: "flex", justifyContent: "space-between" }}>
          <span>LPI</span>
          <span style={{ opacity: 0.8 }}>{settings.lpi ?? ""}</span>
        </span>
        <input
          type="number"
          min={40}
          max={140}
          value={settings.lpi ?? ""}
          onChange={(e) => handleChange("lpi", Number(e.target.value))}
          disabled={!hasImage}
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <span style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Screen angle (deg)</span>
          <span style={{ opacity: 0.8 }}>{settings.angleDeg ?? ""}</span>
        </span>
        <input
          type="number"
          min={-90}
          max={90}
          value={settings.angleDeg ?? ""}
          onChange={(e) => handleChange("angleDeg", Number(e.target.value))}
          disabled={!hasImage}
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <span>Shape</span>
        <select
          value={settings.shape ?? ""}
          onChange={(e) => handleChange("shape", e.target.value)}
          disabled={!hasImage}
          style={{ padding: "0.35rem", borderRadius: "0.4rem", border: "1px solid #555" }}
        >
          <option value="line">Line</option>
          <option value="round">Round</option>
          <option value="square">Square</option>
          <option value="ellipse">Ellipse</option>
        </select>
      </label>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() =>
            handlePreset({
              outputDpi: 320,
              lpi: 80,
              angleDeg: -35,
              shape: "line",
            })
          }
          disabled={!hasImage}
          style={{
            padding: "0.4rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #555",
            background: "transparent",
            color: "#fff",
            cursor: hasImage ? "pointer" : "default",
          }}
        >
          Maple Portrait Default
        </button>
        <button
          type="button"
          onClick={() =>
            handlePreset({
              outputDpi: 300,
              lpi: 70,
              angleDeg: -15,
              shape: "round",
            })
          }
          disabled={!hasImage}
          style={{
            padding: "0.4rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #555",
            background: "transparent",
            color: "#fff",
            cursor: hasImage ? "pointer" : "default",
          }}
        >
          Extra Smooth Skin
        </button>
      </div>

      <AiHalftoneHintsCard analysis={analysis} />
    </div>
  );

  const invalidSettings =
    !settings.outputDpi || settings.outputDpi <= 0 || !settings.lpi || settings.lpi <= 0;

  return (
    <StepShell
      stepNumber={STEP_NUMBER}
      totalSteps={TOTAL_STEPS}
      title="Halftone"
      subtitle="Convert B/W tones into an engraving-friendly pattern."
      preview={previewContent}
      controls={controlsContent}
      onBack={goPrev}
      onContinue={handleContinue}
      continueLabel="Continue"
      continueDisabled={!hasImage || invalidSettings}
    />
  );
}
