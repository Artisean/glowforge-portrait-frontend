import { useEffect, useState } from "react";
import { useWizard } from "../contexts/WizardContext";
import { StepShell } from "../components/layout/StepShell";
import {
  applyBlackAndWhite,
  calculateLuminanceHistogram,
  DEFAULT_BW_SETTINGS,
  type BlackAndWhiteSettings,
} from "../lib/imageBW";
import { getStepNumber, TOTAL_STEPS } from "../lib/wizardConfig";
import { AiToneHintsCard } from "../components/ai/AiToneHintsCard";

const STEP_NUMBER = getStepNumber("blackAndWhite");

function resolveDefaultsFromAnalysis(
  existing: BlackAndWhiteSettings,
  analysis: unknown
): BlackAndWhiteSettings {
  // Conservative: only gently nudge midtones/contrast if globalAdjustments exists
  if (
    analysis &&
    typeof analysis === "object" &&
    "globalAdjustments" in analysis &&
    analysis.globalAdjustments &&
    typeof analysis.globalAdjustments === "object"
  ) {
    const ga = analysis.globalAdjustments as {
      exposure?: number;
      contrast?: number;
      midtoneBoost?: number;
    };
    const exposure = typeof ga.exposure === "number" ? ga.exposure : 0;
    const contrast = typeof ga.contrast === "number" ? ga.contrast * 10 : 0;
    const midtones =
      typeof ga.midtoneBoost === "number" ? ga.midtoneBoost * 10 : 0;

    return {
      ...existing,
      exposure,
      contrast,
      midtones,
    };
  }
  return existing;
}

const PRESETS: {
  label: string;
  value: BlackAndWhiteSettings;
}[] = [
  {
    label: "Maple Portrait (Soft)",
    value: {
      ...DEFAULT_BW_SETTINGS,
      exposure: 0.1,
      contrast: -10,
      midtones: 10,
      preset: "mapleSoft",
    },
  },
  {
    label: "High Contrast Test",
    value: {
      ...DEFAULT_BW_SETTINGS,
      exposure: 0,
      contrast: 20,
      midtones: -10,
      preset: "highContrastTest",
    },
  },
];

export function BlackAndWhiteStep() {
  const {
    imageWorking,
    setWorkingImage,
    analysis,
    blackAndWhiteSettings,
    setBlackAndWhiteSettings,
    goNext,
    goPrev,
  } = useWizard();

  const [settings, setSettings] = useState<BlackAndWhiteSettings>(() =>
    resolveDefaultsFromAnalysis(
      blackAndWhiteSettings ?? DEFAULT_BW_SETTINGS,
      analysis
    )
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [histogram, setHistogram] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Persist settings to context whenever they change.
    setBlackAndWhiteSettings(settings);
  }, [settings, setBlackAndWhiteSettings]);

  useEffect(() => {
    if (!imageWorking) {
      setPreview(null);
      setHistogram([]);
      return;
    }

    let cancelled = false;
    setProcessing(true);
    setError(null);

    const handle = window.setTimeout(async () => {
      try {
        const bw = await applyBlackAndWhite(imageWorking, settings);
        if (cancelled) return;
        setPreview(bw);
        try {
          const hist = await calculateLuminanceHistogram(bw);
          if (!cancelled) setHistogram(hist);
        } catch {
          // histogram is optional; ignore errors
        }
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

  const hasImage = Boolean(imageWorking);

  function handleSliderChange<K extends keyof BlackAndWhiteSettings>(
    key: K,
    value: number
  ) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
      preset: undefined,
    }));
  }

  function handlePresetSelect(next: BlackAndWhiteSettings) {
    setSettings(next);
  }

  function handleContinue() {
    if (preview) {
      setWorkingImage(preview);
      goNext();
    }
  }

  const previewContent = hasImage ? (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div
        style={{
          border: "1px solid #444",
          borderRadius: "0.75rem",
          padding: "0.75rem",
          background: "#0f0f0f",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>Preview</strong>
        {processing && (
          <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            Updating preview...
          </span>
        )}
        </div>

        <div
          style={{
            marginTop: "0.75rem",
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111",
            borderRadius: "0.5rem",
            overflow: "hidden",
          }}
        >
          <img
            src={preview ?? imageWorking ?? ""}
            alt="Black and white preview"
            style={{
              maxWidth: "100%",
              maxHeight: "360px",
              objectFit: "contain",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              marginTop: "0.5rem",
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

      <div>
        <strong>Histogram</strong>
        <div
          style={{
            marginTop: "0.5rem",
            height: "120px",
            display: "flex",
            alignItems: "flex-end",
            gap: "1px",
            background: "#0c0c0c",
            border: "1px solid #333",
            borderRadius: "0.5rem",
            padding: "0.25rem",
          }}
        >
          {histogram.length === 256 ? (
            histogram.map((value, idx) => (
              <div
                key={idx}
                style={{
                  width: "calc(100% / 256)",
                  height: `${value}%`,
                  background: "linear-gradient(180deg, #fff, #666)",
                }}
              />
            ))
          ) : (
            <div style={{ padding: "0.5rem", color: "#aaa" }}>
              Waiting for preview...
            </div>
          )}
        </div>
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
      <strong>Channel mix</strong>
      {([
        ["redChannel", "Red"],
        ["greenChannel", "Green"],
        ["blueChannel", "Blue"],
      ] as const).map(([key, label]) => (
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
            min={-100}
            max={100}
            step={1}
            value={(settings as any)[key] as number}
            onChange={(e) => handleSliderChange(key, Number(e.target.value))}
            disabled={!hasImage}
          />
        </label>
      ))}

      <strong>Tone</strong>
      {([
        ["exposure", "Exposure (-2 to +2 stops)", -2, 2, 0.05],
        ["contrast", "Contrast", -100, 100, 1],
        ["midtones", "Midtones", -100, 100, 1],
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

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handlePresetSelect(preset.value)}
            disabled={!hasImage}
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: "0.5rem",
              border:
                settings.preset === preset.value.preset
                  ? "2px solid #fff"
                  : "1px solid #555",
              background:
                settings.preset === preset.value.preset ? "#fff" : "transparent",
              color: settings.preset === preset.value.preset ? "#111" : "#fff",
              cursor: hasImage ? "pointer" : "default",
              fontSize: "0.9rem",
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <AiToneHintsCard analysis={analysis} />
    </div>
  );

  return (
    <StepShell
      stepNumber={STEP_NUMBER}
      totalSteps={TOTAL_STEPS}
      title="Black & White"
      subtitle="Convert to monochrome and balance tones per color channel."
      preview={previewContent}
      controls={controlsContent}
      onBack={goPrev}
      onContinue={handleContinue}
      continueLabel="Apply & Continue"
      continueDisabled={!hasImage || processing || !preview}
    />
  );
}
