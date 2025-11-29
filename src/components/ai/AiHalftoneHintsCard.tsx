import { type AiAnalysisResult } from "../../lib/api";

interface AiHalftoneHintsCardProps {
  analysis: AiAnalysisResult | null;
}

export function AiHalftoneHintsCard({
  analysis,
}: AiHalftoneHintsCardProps) {
  const halftone = analysis?.halftone;
  const dotGain = analysis?.dotGainRisk;

  return (
    <div
      style={{
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
      <div style={{ fontWeight: 600 }}>Halftone hints</div>
      {halftone ? (
        <div style={{ opacity: 0.9 }}>
          AI starting point: {halftone.outputDpi} dpi, {halftone.lpi} LPI, angle{" "}
          {halftone.angleDeg}°, shape {String(halftone.shape)}.
        </div>
      ) : (
        <div style={{ opacity: 0.8 }}>
          No halftone suggestion available; pick a reasonable starting point (e.g., ~80
          LPI, 300–340 dpi).
        </div>
      )}

      {dotGain && (
        <div style={{ opacity: 0.9 }}>
          Dot gain risk ({dotGain.level}): {dotGain.message}
          {dotGain.level === "high"
            ? " — consider slightly lower contrast or DPI if you see filling."
            : ""}
        </div>
      )}

      <div style={{ opacity: 0.8 }}>
        These are starting defaults. Always test on scrap before committing to the
        final piece.
      </div>
    </div>
  );
}
