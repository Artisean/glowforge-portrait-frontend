import { useCallback, useState } from "react";
import {
  aiAnalyzePhoto,
  type AiAnalyzePhotoOptions,
  type AiAnalyzePhotoResponse,
} from "../lib/api";

interface UseAiAnalysisResult {
  loading: boolean;
  result: AiAnalyzePhotoResponse | null;
  error: string | null;
  runAnalysis: (
    imageDataUrl: string,
    options?: AiAnalyzePhotoOptions
  ) => Promise<void>;
}

/**
 * Wraps aiAnalyzePhoto with simple loading / result / error state
 * so components can trigger analysis without duplicating boilerplate.
 */
export function useAiAnalysis(): UseAiAnalysisResult {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiAnalyzePhotoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(
    async (imageDataUrl: string, options?: AiAnalyzePhotoOptions) => {
      setLoading(true);
      setResult(null);
      setError(null);

      try {
        const response = await aiAnalyzePhoto(imageDataUrl, options);
        setResult(response);
        console.log("aiAnalyzePhoto response:", response);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error("aiAnalyzePhoto error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, result, error, runAnalysis };
}
