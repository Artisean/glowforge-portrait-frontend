export interface DodgeBurnSettings {
  overallExposure: number; // -2..2 stops-like
  shadowsLift: number; // -100..100
  highlightsRecover: number; // -100..100
  localContrast: number; // -100..100
}

export const DEFAULT_DODGE_BURN_SETTINGS: DodgeBurnSettings = {
  overallExposure: 0,
  shadowsLift: 0,
  highlightsRecover: 0,
  localContrast: 0,
};

function clamp(value: number, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}

function loadImage(imageDataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Could not load image for dodge & burn processing."));
    img.src = imageDataUrl;
  });
}

function luminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function applyExposure(luma: number, stops: number) {
  const factor = Math.pow(2, stops);
  return luma * factor;
}

function applyShadowsLift(luma: number, lift: number) {
  // Lift only darker values; lift in [-100,100] scaled to 0..1 add
  if (lift === 0) return luma;
  const normalized = luma / 255;
  const liftAmount = (lift / 100) * (1 - normalized);
  return clamp((normalized + liftAmount) * 255);
}

function applyHighlightsRecover(luma: number, recover: number) {
  if (recover === 0) return luma;
  const normalized = luma / 255;
  const recAmount = (recover / 100) * normalized;
  // Compress highlights by blending toward midtones
  const adjusted = normalized - recAmount * (normalized - 0.5);
  return clamp(adjusted * 255);
}

function applyLocalContrast(luma: number, amount: number) {
  if (amount === 0) return luma;
  const c = amount / 100;
  const normalized = luma / 255;
  const adjusted = 0.5 + (normalized - 0.5) * (1 + c);
  return clamp(adjusted * 255);
}

export async function applyDodgeBurn(
  imageDataUrl: string,
  settings: DodgeBurnSettings
): Promise<string> {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context unavailable.");
  }

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let luma = luminance(r, g, b);
    luma = applyExposure(luma, settings.overallExposure);
    luma = applyShadowsLift(luma, settings.shadowsLift);
    luma = applyHighlightsRecover(luma, settings.highlightsRecover);
    luma = applyLocalContrast(luma, settings.localContrast);
    const finalLuma = clamp(luma);

    data[i] = finalLuma;
    data[i + 1] = finalLuma;
    data[i + 2] = finalLuma;
    // alpha unchanged
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}
