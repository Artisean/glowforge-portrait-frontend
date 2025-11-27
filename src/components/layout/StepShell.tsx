import type { ReactNode } from "react";
import { StepHeader } from "./StepHeader";
import "./StepShell.css";

interface StepShellProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  preview: ReactNode;
  controls: ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
}

export function StepShell({
  stepNumber,
  totalSteps,
  title,
  subtitle,
  preview,
  controls,
  onBack,
  onContinue,
  continueLabel,
  continueDisabled,
}: StepShellProps) {
  return (
    <section className="step-shell">
      <StepHeader
        stepNumber={stepNumber}
        totalSteps={totalSteps}
        title={title}
        subtitle={subtitle}
      />

      <div className="step-shell-body">
        <div>{preview}</div>
        <div>{controls}</div>
      </div>

      <div className="step-shell-footer">
        {onBack && (
          <button
            type="button"
            className="step-shell-button secondary"
            onClick={onBack}
          >
            Back
          </button>
        )}
        <button
          type="button"
          className="step-shell-button primary"
          onClick={onContinue}
          disabled={continueDisabled}
        >
          {continueLabel ?? "Continue"}
        </button>
      </div>
    </section>
  );
}
