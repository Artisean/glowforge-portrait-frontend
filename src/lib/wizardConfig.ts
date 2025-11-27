export type WizardStepId =
  | "upload"
  | "blackAndWhite"
  | "crop"
  | "dodgeBurn"
  | "levelsCurves"
  | "halftone"
  | "export";

export interface WizardStep {
  id: WizardStepId;
  label: string;
}

export const STEPS: WizardStep[] = [
  { id: "upload", label: "1. Upload & Prep" },
  { id: "blackAndWhite", label: "2. Black & White" },
  { id: "crop", label: "3. Crop" },
  { id: "dodgeBurn", label: "4. Dodge & Burn" },
  { id: "levelsCurves", label: "5. Levels & Curves" },
  { id: "halftone", label: "6. Halftone" },
  { id: "export", label: "7. Export" },
];

export const TOTAL_STEPS = STEPS.length;

export function getStepNumber(stepId: WizardStepId): number {
  const index = STEPS.findIndex((step) => step.id === stepId);
  return index >= 0 ? index + 1 : 1;
}
