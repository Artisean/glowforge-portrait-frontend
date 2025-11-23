// src/lib/api.ts

// Optional options you can extend later.
export interface AiAnalyzePhotoOptions {
  profile?: string;
}

// Minimal AiAnalysisResult mirror. We can refine this later to match Strategy docs.
export interface AiAnalysisResult {
  faces?: unknown;
  backgroundMask?: unknown;
  globalAdjustments?: unknown;
  notes?: string[];

  // Engraving-aware optional fields (names match the backend stub).
  halftone?: unknown;
  highlightWarning?: unknown;
  shadowWarning?: unknown;
  dotGainRisk?: unknown;
  recommendedEngraveSettings?: unknown;

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
