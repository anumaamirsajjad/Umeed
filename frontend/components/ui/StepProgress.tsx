interface StepProgressProps {
  step: number; // 1-indexed
  total: number;
  label?: string;
}

// Calm progress indicator: thin soft-dot row, not a clinical percentage bar.
export function StepProgress({ step, total, label }: StepProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={label ?? `Step ${step} of ${total}`}
      className="flex items-center justify-center gap-2"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={
            `h-2 rounded-lg transition-all duration-overlay ease-umeed ` +
            (i < step ? 'w-6 bg-primary-500' : 'w-2 bg-primary-200 dark:bg-primary-900/40')
          }
        />
      ))}
    </div>
  );
}
