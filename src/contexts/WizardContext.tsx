import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type AiAnalysisResult } from "../lib/api";
import { type BlackAndWhiteSettings } from "../lib/imageBW";
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
  blackAndWhiteSettings: BlackAndWhiteSettings | null;
  setBlackAndWhiteSettings: (settings: BlackAndWhiteSettings) => void;
  halftoneSettings: {
    outputDpi?: number;
    lpi?: number;
    angleDeg?: number;
    shape?: "round" | "line" | "square" | "ellipse" | string;
  } | null;
  setHalftoneSettings: (
    settings: {
      outputDpi?: number;
      lpi?: number;
      angleDeg?: number;
      shape?: "round" | "line" | "square" | "ellipse" | string;
    }
  ) => void;
  exportSettings: {
    widthInches?: number;
    heightInches?: number;
    exportDpi?: number;
  } | null;
  setExportSettings: (
    settings: {
      widthInches?: number;
      heightInches?: number;
      exportDpi?: number;
    }
  ) => void;
  dodgeBurnSettings: import("../lib/imageDodgeBurn").DodgeBurnSettings | null;
  setDodgeBurnSettings: (
    settings: import("../lib/imageDodgeBurn").DodgeBurnSettings
  ) => void;
  levelsSettings: import("../lib/imageLevels").LevelsSettings | null;
  setLevelsSettings: (
    settings: import("../lib/imageLevels").LevelsSettings
  ) => void;
}

const WizardContext = createContext<WizardState | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [currentStepId, setCurrentStepId] = useState<WizardStepId>("upload");
  const [imageOriginal, setImageOriginal] = useState<string | null>(null);
  const [imageWorking, setImageWorking] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(null);
  const [blackAndWhiteSettings, setBlackAndWhiteSettingsState] =
    useState<BlackAndWhiteSettings | null>(null);
  const [halftoneSettings, setHalftoneSettingsState] = useState<
    {
      outputDpi?: number;
      lpi?: number;
      angleDeg?: number;
      shape?: "round" | "line" | "square" | "ellipse" | string;
    } | null
  >(null);
  const [exportSettings, setExportSettingsState] = useState<
    {
      widthInches?: number;
      heightInches?: number;
      exportDpi?: number;
    } | null
  >(null);
  const [dodgeBurnSettings, setDodgeBurnSettingsState] = useState<
    import("../lib/imageDodgeBurn").DodgeBurnSettings | null
  >(null);
  const [levelsSettings, setLevelsSettingsState] = useState<
    import("../lib/imageLevels").LevelsSettings | null
  >(null);

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

  function setBlackAndWhiteSettings(settings: BlackAndWhiteSettings) {
    setBlackAndWhiteSettingsState(settings);
  }

  function setHalftoneSettings(
    settings: {
      outputDpi?: number;
      lpi?: number;
      angleDeg?: number;
      shape?: "round" | "line" | "square" | "ellipse" | string;
    }
  ) {
    setHalftoneSettingsState(settings);
  }

  function setExportSettings(
    settings: {
      widthInches?: number;
      heightInches?: number;
      exportDpi?: number;
    }
  ) {
    setExportSettingsState(settings);
  }

  function setDodgeBurnSettings(
    settings: import("../lib/imageDodgeBurn").DodgeBurnSettings
  ) {
    setDodgeBurnSettingsState(settings);
  }

  function setLevelsSettings(
    settings: import("../lib/imageLevels").LevelsSettings
  ) {
    setLevelsSettingsState(settings);
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
    blackAndWhiteSettings,
    setBlackAndWhiteSettings,
    halftoneSettings,
    setHalftoneSettings,
    exportSettings,
    setExportSettings,
    dodgeBurnSettings,
    setDodgeBurnSettings,
    levelsSettings,
    setLevelsSettings,
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
