// src/lib/api.ts

// Optional options you can extend later.
export interface AiAnalyzePhotoOptions {
  profile?: string;
}

/**
 * Normalized face region used by the engraving pipeline.
 * All coordinates are 0–1 relative to the image size.
 */
export interface FaceRegion {
  x: number; // left, 0..1
  y: number; // top, 0..1
  width: number; // width, 0..1
  height: number; // height, 0..1
  notes?: string;
  confidence?: number; // 0..1
}

/**
 * Suggested halftone settings for a typical portrait-on-wood engraving.
 * Mirrors the backend stub fields.
 */
export interface HalftoneSuggestion {
  outputDpi: number;
  lpi: number;
  angleDeg: number;
  shape: "line" | "dot" | "other" | string;
}

/**
 * Generic warning about highlight or shadow ranges.
 */
export interface RangeWarning {
  hasIssue: boolean;
  message: string;
}

/**
 * Dot gain risk for the engraving.
 */
export type DotGainRiskLevel = "low" | "medium" | "high" | string;

export interface DotGainRisk {
  level: DotGainRiskLevel;
  message: string;
}

/**
 * Suggested Glowforge-style engrave settings for a photo on wood.
 * Mirrors the backend stub's recommendedEngraveSettings structure.
 */
export interface RecommendedEngraveSettings {
  speed: number;
  power: number;
  lpi: number;
  passes: number;
  focus: "auto" | "manual" | string;
}

/**
 * Core AI analysis result used throughout the wizard.
 * Engraving-aware fields are optional and can be refined over time.
 * This mirrors the backend stub so TypeScript understands all the fields
 * that App.tsx reads (notes, halftone, warnings, dot gain, settings, etc.).
 */
export interface AiAnalysisResult {
  // Core fields
  faces: FaceRegion[];
  backgroundMask: unknown | null;
  globalAdjustments: {
    exposure: number;
    contrast: number;
    midtoneBoost: number;
  };
  notes: string[];

  // Optional engraving-aware fields (ADR-009)
  halftone?: HalftoneSuggestion | null;
  highlightWarning?: RangeWarning | null;
  shadowWarning?: RangeWarning | null;
  dotGainRisk?: DotGainRisk | null;
  recommendedEngraveSettings?: RecommendedEngraveSettings | null;

  // Allow future expansion without breaking callers.
  [key: string]: unknown;
}

export interface AiAnalyzePhotoSuccess {
  success: true;
  analysis: AiAnalysisResult;
}

export interface AiAnalyzePhotoError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type AiAnalyzePhotoResponse =
  | AiAnalyzePhotoSuccess
  | AiAnalyzePhotoError;

/**
 * Call the backend ai-analyze-photo endpoint.
 *
 * - Reads VITE_API_BASE_URL from the environment.
 * - Sends { imageDataUrl, options } as JSON.
 * - Returns the typed { success, analysis?, error? } envelope.
 */
export async function aiAnalyzePhoto(
  imageDataUrl: string,
  options?: AiAnalyzePhotoOptions
): Promise<AiAnalyzePhotoResponse> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "VITE_API_BASE_URL is not configured. Set it in a .env file at the project root."
    );
  }

  const url = `${baseUrl.replace(/\/$/, "")}/api/ai-analyze-photo`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageDataUrl, options }),
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("Backend returned a non-JSON response.");
  }

  const envelope = data as AiAnalyzePhotoResponse;

  if (
    typeof envelope !== "object" ||
    envelope === null ||
    typeof (envelope as any).success !== "boolean"
  ) {
    throw new Error("Backend response does not match expected envelope.");
  }

  return envelope;
}
