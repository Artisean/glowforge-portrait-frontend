export interface LevelsSettings {
  blackPoint: number; // 0..255
  whitePoint: number; // 0..255 (should be > blackPoint)
  gamma: number; // 0.5..2.5
  sharpenAmount: number; // 0..100
}

export const DEFAULT_LEVELS_SETTINGS: LevelsSettings = {
  blackPoint: 0,
  whitePoint: 255,
  gamma: 1,
  sharpenAmount: 30,
};

function clamp(value: number, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}

function loadImage(imageDataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Could not load image for levels processing."));
    img.src = imageDataUrl;
  });
}

function toLuma(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function applyLevelsGamma(
  luma: number,
  blackPoint: number,
  whitePoint: number,
  gamma: number
) {
  const bp = clamp(blackPoint, 0, 254);
  const wp = clamp(whitePoint, bp + 1, 255);
  const normalized = clamp((luma - bp) * (1 / (wp - bp)), 0, 1);
  const adjusted = Math.pow(normalized, 1 / Math.max(gamma, 0.0001));
  return clamp(adjusted * 255);
}

function applySharpen(
  width: number,
  height: number,
  grayData: Uint8ClampedArray,
  amount: number
) {
  if (amount <= 0) return grayData;
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0,
  ];
  const out = new Uint8ClampedArray(grayData.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const idx = py * width + px;
          const kval = kernel[(ky + 1) * 3 + (kx + 1)];
          acc += grayData[idx] * kval;
        }
      }
      const idxOut = y * width + x;
      const mix = amount / 100;
      const sharpened = clamp(acc);
      out[idxOut] = clamp(grayData[idxOut] * (1 - mix) + sharpened * mix);
    }
  }
  return out;
}

export async function applyLevelsAndSharpen(
  imageDataUrl: string,
  settings: LevelsSettings
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

  // First pass: apply levels/gamma to luma
  const gray = new Uint8ClampedArray((data.length / 4) | 0);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const luma = toLuma(data[i], data[i + 1], data[i + 2]);
    const adjusted = applyLevelsGamma(
      luma,
      settings.blackPoint,
      settings.whitePoint,
      settings.gamma
    );
    gray[j] = adjusted;
  }

  // Optional sharpen
  const sharpened = applySharpen(
    canvas.width,
    canvas.height,
    gray,
    settings.sharpenAmount
  );

  // Write back
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const val = sharpened[j];
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    // alpha unchanged
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}
