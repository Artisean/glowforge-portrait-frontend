import { useEffect, useMemo, useState } from "react";
import { useWizard } from "../contexts/WizardContext";
import { getStepNumber, TOTAL_STEPS } from "../lib/wizardConfig";
import {
  applyBlackAndWhite,
  calculateLuminanceHistogram,
  DEFAULT_BW_CHANNELS,
  type BlackAndWhiteChannels,
} from "../lib/imageBW";
import { StepShell } from "../components/layout/StepShell";

const STEP_NUMBER = getStepNumber("blackAndWhite");

export function Step2BlackAndWhite() {
  const {
    imageWorking,
    setWorkingImage,
    analysis,
    goNext,
    goPrev,
  } = useWizard();
  const [channels, setChannels] =
    useState<BlackAndWhiteChannels>(DEFAULT_BW_CHANNELS);
  const [preview, setPreview] = useState<string | null>(null);
  const [histogram, setHistogram] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    setChannels(DEFAULT_BW_CHANNELS);
    setPreview(null);
    setHistogram([]);
  }, [imageWorking]);

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
        const bw = await applyBlackAndWhite(imageWorking, { channels });
        if (cancelled) return;
        setPreview(bw);
        const hist = await calculateLuminanceHistogram(bw);
        if (cancelled) return;
        setHistogram(hist);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        if (!cancelled) setProcessing(false);
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [imageWorking, channels]);

  const analysisHints = useMemo(() => {
    if (!analysis) return [];

    const hints: string[] = [];

    const highlightMsg =
      analysis.highlightWarning && analysis.highlightWarning.hasIssue
        ? analysis.highlightWarning.message
        : null;
    const shadowMsg =
      analysis.shadowWarning && analysis.shadowWarning.hasIssue
        ? analysis.shadowWarning.message
        : null;
    const dotGainMsg = analysis.dotGainRisk
      ? `Dot gain risk (${analysis.dotGainRisk.level}): ${analysis.dotGainRisk.message}`
      : null;

    [highlightMsg, shadowMsg, dotGainMsg].forEach((msg) => {
      if (typeof msg === "string" && msg.trim().length > 0) {
        hints.push(msg.trim());
      }
    });

    return hints;
  }, [analysis]);

  function handleChannelChange(key: keyof BlackAndWhiteChannels, value: number) {
    setChannels((prev) => ({ ...prev, [key]: value }));
  }

  function handleApply() {
    if (preview) {
      setWorkingImage(preview);
    }
    goNext();
  }

  const previewContent = imageWorking ? (
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
          <button
            type="button"
            onClick={() => setShowOriginal((v) => !v)}
            style={{
              fontSize: "0.85rem",
              padding: "0.25rem 0.6rem",
              borderRadius: "999px",
              border: "1px solid #555",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {showOriginal ? "Show B/W" : "Show Original"}
          </button>
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
            src={showOriginal ? imageWorking : preview ?? imageWorking}
            alt="Black and white preview"
            style={{
              maxWidth: "100%",
              maxHeight: "360px",
              objectFit: "contain",
            }}
          />
        </div>

        {processing && (
          <div style={{ marginTop: "0.5rem", opacity: 0.8 }}>
            Processing...
          </div>
        )}
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
      Upload a photo in Step 1 to start adjusting black and white.
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
        ["reds", "Reds"],
        ["yellows", "Yellows"],
        ["greens", "Greens"],
        ["cyans", "Cyans"],
        ["blues", "Blues"],
        ["magentas", "Magentas"],
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
            <span style={{ opacity: 0.8 }}>{channels[key]}</span>
          </span>
          <input
            type="range"
            min={-100}
            max={100}
            step={1}
            value={channels[key]}
            onChange={(e) =>
              handleChannelChange(key, Number(e.target.value))
            }
            disabled={!imageWorking}
          />
        </label>
      ))}

      <div
        style={{
          marginTop: "0.5rem",
          padding: "0.5rem",
          borderRadius: "0.5rem",
          background: "#131313",
          border: "1px solid #333",
          color: "#ddd",
          fontSize: "0.9rem",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
          AI hints
        </div>
        {analysisHints.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No warnings from analysis.</div>
        ) : (
          <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
            {analysisHints.map((hint, idx) => (
              <li key={idx}>{hint}</li>
            ))}
          </ul>
        )}
      </div>
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
      onContinue={handleApply}
      continueLabel="Apply & Continue"
      continueDisabled={processing || !preview}
    />
  );
}
