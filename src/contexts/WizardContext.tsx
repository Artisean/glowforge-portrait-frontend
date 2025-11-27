import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type AiAnalysisResult } from "../lib/api";
import { STEPS, type WizardStepId } from "../lib/wizardConfig";

interface WizardState {
  currentStepId: WizardStepId;
  setCurrentStepId: (id: WizardStepId) => void;
  goNext: () => void;
  goPrev: () => void;
  imageOriginal: string | null;
  imageWorking: string | null;
  setOriginalImage: (url: string | null) => void;
  setWorkingImage: (url: string | null) => void;
  analysis: AiAnalysisResult | null;
  setAnalysis: (result: AiAnalysisResult | null) => void;
}

const WizardContext = createContext<WizardState | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [currentStepId, setCurrentStepId] = useState<WizardStepId>("upload");
  const [imageOriginal, setImageOriginal] = useState<string | null>(null);
  const [imageWorking, setImageWorking] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(null);

  const stepOrder = useMemo(() => STEPS.map((s) => s.id), []);
  const currentIndex = stepOrder.findIndex((id) => id === currentStepId);

  function goNext() {
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStepId(stepOrder[currentIndex + 1]);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentStepId(stepOrder[currentIndex - 1]);
    }
  }

  function setOriginalImage(url: string | null) {
    setImageOriginal(url);
  }

  function setWorkingImage(url: string | null) {
    setImageWorking(url);
  }

  const value: WizardState = {
    currentStepId,
    setCurrentStepId,
    goNext,
    goPrev,
    imageOriginal,
    imageWorking,
    setOriginalImage,
    setWorkingImage,
    analysis,
    setAnalysis,
  };

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useWizard(): WizardState {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used within a WizardProvider.");
  }
  return ctx;
}
