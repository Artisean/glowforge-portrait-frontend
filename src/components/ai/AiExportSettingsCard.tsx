import { type AiAnalysisResult } from "../../lib/api";

interface AiExportSettingsCardProps {
  analysis: AiAnalysisResult | null;
}

export function AiExportSettingsCard({
  analysis,
}: AiExportSettingsCardProps) {
  const settings = analysis?.recommendedEngraveSettings;
  const notes =
    Array.isArray(analysis?.notes) && analysis?.notes.length
      ? analysis?.notes
      : [];

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
      <div style={{ fontWeight: 600 }}>Recommended engrave settings</div>
      {settings ? (
        <div style={{ opacity: 0.9 }}>
          Speed {settings.speed}, power {settings.power}, {settings.lpi} LPI,{" "}
          {settings.passes} pass{settings.passes !== 1 ? "es" : ""}, focus{" "}
          {settings.focus}
        </div>
      ) : (
        <div style={{ opacity: 0.8 }}>
          No suggested settings. Start from your machine’s photo preset and test on
          scrap.
        </div>
      )}

      {notes.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: "0.15rem" }}>
            Notes
          </div>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ opacity: 0.7, fontSize: "0.85rem" }}>
        Starting point only. Always run a small test patch on your material.
      </div>
    </div>
  );
}
