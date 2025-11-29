import { type AiAnalysisResult } from "../../lib/api";

interface AiToneHintsCardProps {
  analysis: AiAnalysisResult | null;
}

export function AiToneHintsCard({ analysis }: AiToneHintsCardProps) {
  if (!analysis) {
    return (
      <div
        style={{
          padding: "0.5rem",
          borderRadius: "0.5rem",
          border: "1px dashed #444",
          background: "#0f0f0f",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Tone hints</div>
        <div style={{ opacity: 0.8 }}>
          AI hints unavailable. You can still adjust manually and test on scrap.
        </div>
      </div>
    );
  }

  const { globalAdjustments, highlightWarning, shadowWarning, dotGainRisk, notes } =
    analysis;

  const toneSummary: string[] = [];
  if (globalAdjustments) {
    const { exposure, contrast, midtoneBoost } = globalAdjustments as {
      exposure?: number;
      contrast?: number;
      midtoneBoost?: number;
    };
    if (typeof exposure === "number") {
      toneSummary.push(
        `Exposure: ${exposure > 0 ? "slightly high" : exposure < 0 ? "slightly low" : "neutral"}`
      );
    }
    if (typeof contrast === "number") {
      toneSummary.push(
        `Contrast: ${contrast > 0 ? "higher" : contrast < 0 ? "lower" : "balanced"}`
      );
    }
    if (typeof midtoneBoost === "number") {
      toneSummary.push(
        `Midtones: ${midtoneBoost > 0 ? "lifted" : midtoneBoost < 0 ? "suppressed" : "neutral"}`
      );
    }
  }

  const warnings: string[] = [];
  if (highlightWarning?.hasIssue) warnings.push(highlightWarning.message);
  if (shadowWarning?.hasIssue) warnings.push(shadowWarning.message);
  if (dotGainRisk) {
    warnings.push(`Dot gain risk (${dotGainRisk.level}): ${dotGainRisk.message}`);
  }

  const toneNotes =
    Array.isArray(notes) && notes.length > 0
      ? notes.slice(0, 3).filter((n) => typeof n === "string" && n.trim().length > 0)
      : [];

  return (
    <div
      style={{
        marginTop: "0.5rem",
        padding: "0.5rem",
        borderRadius: "0.5rem",
        background: "#131313",
        border: "1px solid #333",
        color: "#ddd",
        fontSize: "0.9rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
      }}
    >
      <div style={{ fontWeight: 600 }}>Tone hints</div>

      {toneSummary.length > 0 && (
        <div style={{ opacity: 0.9 }}>
          {toneSummary.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: "0.15rem" }}>Warnings</div>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {warnings.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {toneNotes.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: "0.15rem" }}>Notes</div>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {toneNotes.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
