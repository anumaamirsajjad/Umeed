interface HeaderBandProps {
  heading: string;
  subtext: string;
}

// Soft warm gradient band with a hand-drawn sunrise line icon — shared by
// every onboarding step per design spec.
export function HeaderBand({ heading, subtext }: HeaderBandProps) {
  return (
    <div className="bg-gradient-to-b from-primary-50 to-primary-100 dark:from-surface-darker dark:to-primary-900/30 px-6 pt-16 pb-8">
      <svg
        className="w-10 h-10 mb-4 text-primary-500 dark:text-primary-300"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 26h28" />
        <path d="M11 26a9 9 0 0118 0" />
        <path d="M20 12V7" />
        <path d="M11.5 15.5l-3-3" />
        <path d="M28.5 15.5l3-3" />
      </svg>
      <h1 className="font-serif text-2xl font-bold text-ink-light dark:text-ink-dark">{heading}</h1>
      <p className="mt-2 text-sm text-ink-muted">{subtext}</p>
    </div>
  );
}

export default HeaderBand;
