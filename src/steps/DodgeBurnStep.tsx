import { useEffect, useState } from "react";
import { useWizard } from "../contexts/WizardContext";
import { StepShell } from "../components/layout/StepShell";
import { getStepNumber, TOTAL_STEPS } from "../lib/wizardConfig";
import {
  applyDodgeBurn,
  DEFAULT_DODGE_BURN_SETTINGS,
  type DodgeBurnSettings,
} from "../lib/imageDodgeBurn";
import { AiToneHintsCard } from "../components/ai/AiToneHintsCard";

const STEP_NUMBER = getStepNumber("dodgeBurn");

export function DodgeBurnStep() {
  const {
    imageWorking,
    analysis,
    dodgeBurnSettings,
    setDodgeBurnSettings,
    goNext,
    goPrev,
    setWorkingImage,
  } = useWizard();
  const hasImage = Boolean(imageWorking);
  const [settings, setSettings] = useState<DodgeBurnSettings>(
    dodgeBurnSettings ?? DEFAULT_DODGE_BURN_SETTINGS
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDodgeBurnSettings(settings);
  }, [settings, setDodgeBurnSettings]);

  useEffect(() => {
    if (!imageWorking) {
      setPreview(null);
      return;
    }

    let cancelled = false;
    setProcessing(true);
    setError(null);

    const handle = window.setTimeout(async () => {
      try {
        const result = await applyDodgeBurn(imageWorking, settings);
        if (cancelled) return;
        setPreview(result);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        if (!cancelled) setProcessing(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [imageWorking, settings]);

  function handleSliderChange<K extends keyof DodgeBurnSettings>(
    key: K,
    value: number
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handlePresetLighten() {
    setSettings((prev) => ({
      ...prev,
      overallExposure: -0.1,
      shadowsLift: 10,
      highlightsRecover: 10,
      localContrast: 5,
    }));
  }

  function handleContinue() {
    if (preview) {
      setWorkingImage(preview);
    }
    goNext();
  }

  const previewContent = hasImage ? (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
        <strong>Dodge &amp; Burn preview</strong>
        <img
          src={preview ?? imageWorking ?? ""}
          alt="Dodge & Burn preview"
          style={{
            maxWidth: "100%",
            maxHeight: "320px",
            objectFit: "contain",
            borderRadius: "0.75rem",
            border: "1px solid #444",
            background: "#000",
          }}
        />
        {processing && (
          <div style={{ opacity: 0.8, fontSize: "0.9rem" }}>
            Updating preview...
          </div>
        )}
        {error && (
          <div
            style={{
              marginTop: "0.25rem",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #f99",
              background: "#311",
              color: "#fdd",
            }}
          >
            {error}
          </div>
        )}
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
      <strong>Adjustments</strong>
      {([
        ["overallExposure", "Overall Exposure (-2..2 stops)", -2, 2, 0.05],
        ["shadowsLift", "Shadows Lift", -100, 100, 1],
        ["highlightsRecover", "Highlights Recover", -100, 100, 1],
        ["localContrast", "Local Contrast", -100, 100, 1],
      ] as const).map(([key, label, min, max, step]) => (
        <label
          key={key}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          <span
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.9rem",
            }}
          >
            <span>{label}</span>
            <span style={{ opacity: 0.8 }}>
              {(settings as any)[key] as number}
            </span>
          </span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={(settings as any)[key] as number}
            onChange={(e) => handleSliderChange(key, Number(e.target.value))}
            disabled={!hasImage}
          />
        </label>
      ))}

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handlePresetLighten}
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
          Lighten subject / darken bg
        </button>
      </div>

      <AiToneHintsCard analysis={analysis} />
    </div>
  );

  return (
    <StepShell
      stepNumber={STEP_NUMBER}
      totalSteps={TOTAL_STEPS}
      title="Dodge & Burn"
      subtitle="Fine-tune tones after Black & White."
      preview={previewContent}
      controls={controlsContent}
      onBack={goPrev}
      onContinue={handleContinue}
      continueLabel="Apply & Continue"
      continueDisabled={!hasImage || processing}
    />
  );
}
