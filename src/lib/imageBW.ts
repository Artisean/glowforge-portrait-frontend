export type BlackAndWhiteChannels = {
  reds: number;
  yellows: number;
  greens: number;
  cyans: number;
  blues: number;
  magentas: number;
};

export interface BlackAndWhiteSettings {
  channels: BlackAndWhiteChannels;
  // Extend later with tone controls (e.g., contrast, midtones) as needed.
}

export const DEFAULT_BW_CHANNELS: BlackAndWhiteChannels = {
  reds: 0,
  yellows: 0,
  greens: 0,
  cyans: 0,
  blues: 0,
  magentas: 0,
};

const LUMA = { r: 0.299, g: 0.587, b: 0.114 };

function clamp(value: number, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}

function loadImage(imageDataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Could not load image for processing."));
    img.src = imageDataUrl;
  });
}

function luminance(r: number, g: number, b: number) {
  return r * LUMA.r + g * LUMA.g + b * LUMA.b;
}

function rgbToHue(r: number, g: number, b: number): number {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  if (delta === 0) return 0;

  let hue = 0;
  if (max === rn) {
    hue = ((gn - bn) / delta) % 6;
  } else if (max === gn) {
    hue = (bn - rn) / delta + 2;
  } else {
    hue = (rn - gn) / delta + 4;
  }

  return ((hue * 60 + 360) % 360);
}

function channelForHue(hue: number): keyof BlackAndWhiteChannels {
  if (hue < 30 || hue >= 330) return "reds";
  if (hue < 90) return "yellows";
  if (hue < 150) return "greens";
  if (hue < 210) return "cyans";
  if (hue < 270) return "blues";
  return "magentas";
}

/**
 * Slider range is -100..100; factor is centered at 1 so 0 keeps luminance as-is.
 * -100 darkens to 50% of original, +100 brightens to 150%.
 */
function scaleLuminance(base: number, slider: number) {
  const factor = 1 + slider / 200;
  return clamp(base * factor);
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
  if (!ctx) throw new Error("Canvas context unavailable.");

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const hue = rgbToHue(r, g, b);
    const channel = channelForHue(hue);
    const baseLuma = luminance(r, g, b);
    const adjusted = scaleLuminance(baseLuma, settings.channels[channel]);

    data[i] = adjusted;
    data[i + 1] = adjusted;
    data[i + 2] = adjusted;
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
  if (!ctx) throw new Error("Canvas context unavailable.");

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const bins = new Array(256).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const luma = Math.round(luminance(data[i], data[i + 1], data[i + 2]));
    bins[luma] += 1;
  }

  const maxBin = Math.max(...bins) || 1;
  return bins.map((count) => Math.round((count / maxBin) * 100));
}
