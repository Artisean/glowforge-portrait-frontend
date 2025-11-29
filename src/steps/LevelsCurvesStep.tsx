import { useEffect, useState } from "react";
import { useWizard } from "../contexts/WizardContext";
import { StepShell } from "../components/layout/StepShell";
import { getStepNumber, TOTAL_STEPS } from "../lib/wizardConfig";
import {
  applyLevelsAndSharpen,
  DEFAULT_LEVELS_SETTINGS,
  type LevelsSettings,
} from "../lib/imageLevels";
import { AiToneHintsCard } from "../components/ai/AiToneHintsCard";

const STEP_NUMBER = getStepNumber("levelsCurves");

export function LevelsCurvesStep() {
  const {
    imageWorking,
    analysis,
    levelsSettings,
    setLevelsSettings,
    goNext,
    goPrev,
    setWorkingImage,
  } = useWizard();
  const hasImage = Boolean(imageWorking);
  const [settings, setSettings] = useState<LevelsSettings>(
    levelsSettings ?? DEFAULT_LEVELS_SETTINGS
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLevelsSettings(settings);
  }, [settings, setLevelsSettings]);

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
        const result = await applyLevelsAndSharpen(imageWorking, settings);
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

  function handleChange<K extends keyof LevelsSettings>(
    key: K,
    value: number
  ) {
    setSettings((prev) => {
      if (key === "whitePoint" && value <= prev.blackPoint) {
        value = prev.blackPoint + 1;
      }
      if (key === "blackPoint" && value >= prev.whitePoint) {
        value = prev.whitePoint - 1;
      }
      return { ...prev, [key]: value };
    });
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
        <strong>Levels &amp; Sharpen preview</strong>
        <img
          src={preview ?? imageWorking ?? ""}
          alt="Levels preview"
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
      <strong>Levels &amp; sharpen</strong>

      {[
        {
          key: "blackPoint",
          label: "Black point",
          min: 0,
          max: 254,
          step: 1,
        },
        {
          key: "whitePoint",
          label: "White point",
          min: 1,
          max: 255,
          step: 1,
        },
        {
          key: "gamma",
          label: "Gamma (0.5–2.5)",
          min: 0.5,
          max: 2.5,
          step: 0.05,
        },
        {
          key: "sharpenAmount",
          label: "Sharpen amount",
          min: 0,
          max: 100,
          step: 1,
        },
      ].map(({ key, label, min, max, step }) => (
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
            onChange={(e) => handleChange(key as any, Number(e.target.value))}
            disabled={!hasImage}
          />
        </label>
      ))}

      <AiToneHintsCard analysis={analysis} />
    </div>
  );

  return (
    <StepShell
      stepNumber={STEP_NUMBER}
      totalSteps={TOTAL_STEPS}
      title="Levels & Sharpen"
      subtitle="Set black/white points and crispness before halftone."
      preview={previewContent}
      controls={controlsContent}
      onBack={goPrev}
      onContinue={handleContinue}
      continueLabel="Apply & Continue"
      continueDisabled={!hasImage || processing}
    />
  );
}
