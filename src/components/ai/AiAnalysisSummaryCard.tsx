import { type AiAnalysisResult } from "../../lib/api";

interface AiAnalysisSummaryCardProps {
  analysis: AiAnalysisResult | null;
}

export function AiAnalysisSummaryCard({ analysis }: AiAnalysisSummaryCardProps) {
  if (!analysis) {
    return (
      <div
        style={{
          padding: "0.75rem",
          borderRadius: "0.75rem",
          border: "1px dashed #444",
          background: "#0f0f0f",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: "0.35rem" }}>
          AI analysis
        </div>
        <div style={{ opacity: 0.8 }}>
          No analysis yet. Run Analyze to see hints, or continue with manual adjustments.
        </div>
      </div>
    );
  }

  const warnings: string[] = [];
  if (analysis.highlightWarning?.hasIssue) {
    warnings.push(analysis.highlightWarning.message);
  }
  if (analysis.shadowWarning?.hasIssue) {
    warnings.push(analysis.shadowWarning.message);
  }

  return (
    <div
      style={{
        padding: "0.75rem",
        borderRadius: "0.75rem",
        border: "1px solid #333",
        background: "#0f0f0f",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div style={{ fontWeight: 600 }}>AI analysis</div>

      {Array.isArray(analysis.notes) && analysis.notes.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Notes</div>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {analysis.notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Warnings</div>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {warnings.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.dotGainRisk && (
        <div
          style={{
            padding: "0.5rem",
            borderRadius: "0.5rem",
            background: "#131313",
            border: "1px solid #333",
          }}
        >
          <div style={{ fontWeight: 600 }}>Dot gain risk</div>
          <div style={{ opacity: 0.9 }}>
            Level: {analysis.dotGainRisk.level} — {analysis.dotGainRisk.message}
          </div>
        </div>
      )}

      {analysis.halftone && (
        <div style={{ opacity: 0.9 }}>
          Halftone suggestion: {analysis.halftone.outputDpi} dpi,{" "}
          {analysis.halftone.lpi} LPI, angle {analysis.halftone.angleDeg}°, shape{" "}
          {String(analysis.halftone.shape)}
        </div>
      )}

      {analysis.recommendedEngraveSettings && (
        <div style={{ opacity: 0.9 }}>
          Starting settings: {analysis.recommendedEngraveSettings.speed} speed,{" "}
          {analysis.recommendedEngraveSettings.power} power,{" "}
          {analysis.recommendedEngraveSettings.lpi} LPI,{" "}
          {analysis.recommendedEngraveSettings.passes} pass
          {analysis.recommendedEngraveSettings.passes !== 1 ? "es" : ""}, focus{" "}
          {analysis.recommendedEngraveSettings.focus}
        </div>
      )}

      <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>
        These hints are starting points. Always run a small test on scrap before final
        engraving. If hints are missing, continue manually.
      </div>
    </div>
  );
}
