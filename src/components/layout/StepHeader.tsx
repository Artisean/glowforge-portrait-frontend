interface StepHeaderProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
}

export function StepHeader({
  stepNumber,
  totalSteps,
  title,
  subtitle,
}: StepHeaderProps) {
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <div style={{ fontSize: "0.8rem", letterSpacing: "0.08em", opacity: 0.7 }}>
        STEP {stepNumber} OF {totalSteps}
      </div>
      <h2 style={{ margin: 0 }}>{title}</h2>
      {subtitle && (
        <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.4 }}>{subtitle}</p>
      )}
    </header>
  );
}
