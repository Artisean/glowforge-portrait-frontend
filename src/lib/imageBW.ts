export interface BlackAndWhiteSettings {
  redChannel: number; // -100..100
  greenChannel: number; // -100..100
  blueChannel: number; // -100..100
  exposure: number; // -2..2 (stops-like)
  contrast: number; // -100..100
  midtones: number; // -100..100 (gamma-ish)
  preset?: "mapleSoft" | "highContrastTest" | string;
}

export const DEFAULT_BW_SETTINGS: BlackAndWhiteSettings = {
  redChannel: 0,
  greenChannel: 0,
  blueChannel: 0,
  exposure: 0,
  contrast: 0,
  midtones: 0,
  preset: undefined,
};

function clamp(value: number, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}

function loadImage(imageDataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Could not load image for black & white processing."));
    img.src = imageDataUrl;
  });
}

function applyExposure(luma: number, stops: number) {
  const factor = Math.pow(2, stops);
  return luma * factor;
}

function applyContrast(luma: number, contrast: number) {
  const c = clamp(contrast, -100, 100) / 100;
  const factor = (1 + c);
  // Centered contrast adjustment around mid-gray (0.5)
  const normalized = luma / 255;
  const adjusted = 0.5 + (normalized - 0.5) * factor;
  return adjusted * 255;
}

function applyMidtones(luma: number, midtones: number) {
  const m = clamp(midtones, -100, 100) / 100;
  // Gamma-like adjustment: >0 lifts midtones, <0 deepens
  const gamma = m >= 0 ? 1 / (1 + m) : 1 + Math.abs(m);
  const normalized = luma / 255;
  const adjusted = Math.pow(normalized, gamma);
  return adjusted * 255;
}

export async function applyBlackAndWhite(
  imageDataUrl: string,
  settings: BlackAndWhiteSettings
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

  const rWeight = 0.299 + (settings.redChannel / 100) * 0.299;
  const gWeight = 0.587 + (settings.greenChannel / 100) * 0.587;
  const bWeight = 0.114 + (settings.blueChannel / 100) * 0.114;
  const weightSum = rWeight + gWeight + bWeight || 1;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let luma = (r * rWeight + g * gWeight + b * bWeight) / weightSum;
    luma = applyExposure(luma, settings.exposure);
    luma = applyContrast(luma, settings.contrast);
    luma = applyMidtones(luma, settings.midtones);
    const finalLuma = clamp(luma);

    data[i] = finalLuma;
    data[i + 1] = finalLuma;
    data[i + 2] = finalLuma;
    // alpha unchanged
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

export async function calculateLuminanceHistogram(
  imageDataUrl: string
): Promise<number[]> {
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

  const bins = new Array(256).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const luma = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    bins[luma] += 1;
  }

  const maxBin = Math.max(...bins) || 1;
  return bins.map((count) => Math.round((count / maxBin) * 100));
}
