import { useEffect, useMemo, useState } from "react";
import { useWizard } from "../contexts/WizardContext";
import { StepShell } from "../components/layout/StepShell";
import { getStepNumber, TOTAL_STEPS } from "../lib/wizardConfig";
import { AiExportSettingsCard } from "../components/ai/AiExportSettingsCard";

const STEP_NUMBER = getStepNumber("export");

type ExportSettings = {
  widthInches?: number;
  heightInches?: number;
  exportDpi?: number;
};

const DEFAULT_EXPORT: ExportSettings = {
  widthInches: 6,
  heightInches: 8,
  exportDpi: 320,
};

function downloadPng(
  imageDataUrl: string,
  widthPx: number,
  heightPx: number,
  filename = "engrave-export.png"
) {
  const img = new Image();
  img.src = imageDataUrl;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, widthPx, heightPx);
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };
}

export function ExportStep() {
  const {
    imageWorking,
    analysis,
    halftoneSettings,
    exportSettings,
    setExportSettings,
    goPrev,
  } = useWizard();
  const hasImage = Boolean(imageWorking);

  const [settings, setSettings] = useState<ExportSettings>(() => {
    return exportSettings ?? DEFAULT_EXPORT;
  });

  useEffect(() => {
    setExportSettings(settings);
  }, [settings, setExportSettings]);

  const aspectRatio = useMemo(() => {
    const w = settings.widthInches ?? DEFAULT_EXPORT.widthInches!;
    const h = settings.heightInches ?? DEFAULT_EXPORT.heightInches!;
    return w && h ? w / h : 1;
  }, [settings.widthInches, settings.heightInches]);

  function updateWidth(next: number) {
    const dpi = settings.exportDpi ?? DEFAULT_EXPORT.exportDpi!;
    const height = next / aspectRatio;
    setSettings((prev) => ({ ...prev, widthInches: next, heightInches: height, exportDpi: dpi }));
  }

  function updateHeight(next: number) {
    const dpi = settings.exportDpi ?? DEFAULT_EXPORT.exportDpi!;
    const width = next * aspectRatio;
    setSettings((prev) => ({ ...prev, widthInches: width, heightInches: next, exportDpi: dpi }));
  }

  function updateDpi(next: number) {
    setSettings((prev) => ({ ...prev, exportDpi: next }));
  }

  const exportDpi = settings.exportDpi ?? DEFAULT_EXPORT.exportDpi!;
  const widthIn = settings.widthInches ?? DEFAULT_EXPORT.widthInches!;
  const heightIn = settings.heightInches ?? DEFAULT_EXPORT.heightInches!;
  const widthPx = Math.max(1, Math.round(widthIn * exportDpi));
  const heightPx = Math.max(1, Math.round(heightIn * exportDpi));

  function handleDownloadPng() {
    if (!imageWorking) return;
    downloadPng(imageWorking, widthPx, heightPx);
  }

  function handleDownloadTestPatch() {
    if (!imageWorking) return;
    const patchPx = Math.round((2 * exportDpi) || 640); // 2-inch square at dpi
    downloadPng(imageWorking, patchPx, patchPx, "engrave-test-patch.png");
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
      <strong>
        Export preview ({widthIn.toFixed(2)}" × {heightIn.toFixed(2)}" at{" "}
        {exportDpi} dpi)
      </strong>
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
      {halftoneSettings && (
        <div style={{ opacity: 0.8, fontSize: "0.9rem" }}>
          Halftone settings: {halftoneSettings.outputDpi ?? "?"} dpi,{" "}
          {halftoneSettings.lpi ?? "?"} LPI, angle {halftoneSettings.angleDeg ?? "?"}°, shape{" "}
          {String(halftoneSettings.shape ?? "?")}
        </div>
      )}
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
      <strong>Physical size &amp; DPI</strong>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span>Width (in)</span>
          <input
            type="number"
            min={1}
            step={0.1}
            value={widthIn}
            onChange={(e) => updateWidth(Number(e.target.value))}
            disabled={!hasImage}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span>Height (in)</span>
          <input
            type="number"
            min={1}
            step={0.1}
            value={heightIn}
            onChange={(e) => updateHeight(Number(e.target.value))}
            disabled={!hasImage}
          />
        </label>
      </div>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <span>Export DPI</span>
        <select
          value={exportDpi}
          onChange={(e) => updateDpi(Number(e.target.value))}
          disabled={!hasImage}
          style={{ padding: "0.35rem", borderRadius: "0.4rem", border: "1px solid #555" }}
        >
          {[270, 300, 320, 340, 400].map((dpi) => (
            <option key={dpi} value={dpi}>
              {dpi} dpi
            </option>
          ))}
        </select>
      </label>

      <div style={{ opacity: 0.9 }}>
        Export size: {widthPx} × {heightPx} px
      </div>

      <AiExportSettingsCard analysis={analysis} />

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={!hasImage}
          style={{
            padding: "0.5rem 0.9rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#fff",
            color: "#111",
            fontWeight: 600,
            cursor: hasImage ? "pointer" : "default",
          }}
        >
          Download PNG
        </button>
        <button
          type="button"
          disabled
          style={{
            padding: "0.5rem 0.9rem",
            borderRadius: "0.5rem",
            border: "1px solid #555",
            background: "transparent",
            color: "#888",
            cursor: "not-allowed",
          }}
        >
          Download SVG (coming soon)
        </button>
        <button
          type="button"
          onClick={handleDownloadTestPatch}
          disabled={!hasImage}
          style={{
            padding: "0.5rem 0.9rem",
            borderRadius: "0.5rem",
            border: "1px solid #555",
            background: "transparent",
            color: "#fff",
            cursor: hasImage ? "pointer" : "default",
          }}
        >
          Export test patch
        </button>
      </div>
    </div>
  );

  return (
    <StepShell
      stepNumber={STEP_NUMBER}
      totalSteps={TOTAL_STEPS}
      title="Export"
      subtitle="Lock in size, DPI, and starting engrave settings."
      preview={previewContent}
      controls={controlsContent}
      onBack={goPrev}
      onContinue={() => {}}
      continueLabel="Finish"
      continueDisabled={!hasImage}
    />
  );
}
