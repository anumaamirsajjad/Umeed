// Single stroke-line icon set (1.75px stroke, rounded caps) so every page
// pulls from one consistent visual language instead of emoji or one-off SVGs.
const PATHS: Record<string, React.ReactNode> = {
  chat: <path d="M4 4.5h16a1 1 0 011 1v11a1 1 0 01-1 1H9l-4.5 4v-4H4a1 1 0 01-1-1v-11a1 1 0 011-1z" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 5-5 2 2-5 5-2z" />
    </>
  ),
  lifebuoy: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M17.7 6.3l-2.5 2.5M8.8 15.2l-2.5 2.5" />
    </>
  ),
  shield: <path d="M12 3l7 3v6c0 5-3 8.5-7 9-4-.5-7-4-7-9V6l7-3z" />,
  phone: <path d="M6 3h3l1.5 4-2 1.5a11 11 0 005.5 5.5l1.5-2 4 1.5v3a2 2 0 01-2 2C10.6 19 5 13.4 5 6a2 2 0 011-3z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6l8.5 6.5L20.5 6" />
    </>
  ),
  pencil: <path d="M4 20l1-4.2L16.2 4.6a1.5 1.5 0 012.1 0l1.1 1.1a1.5 1.5 0 010 2.1L8.2 19 4 20z" />,
  trash: <path d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0v12a1 1 0 001 1h6a1 1 0 001-1V7" />,
  home: <path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8z" />,
  sparkle: <path d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3zM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z" />,
  download: <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.8-4.8" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9.5" r="2.5" />
      <path d="M21 20c0-2.6-1.7-4.8-4-5.6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7" />
    </>
  ),
  flag: <path d="M6 3v18M6 4h11l-2.5 3.5L17 11H6" />,
  leaf: <path d="M5 19c8 0 14-6 14-14 0 0-9 0-13 4S5 19 5 19z" />,
  house: <path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8z" />,
  heart: <path d="M12 20s-7-4.4-9.5-9C.7 7.2 2.7 4 6 4c2 0 3.5 1.2 4.5 2.7C11.5 5.2 13 4 15 4c3.3 0 5.3 3.2 3.5 7-2.5 4.6-9.5 9-9.5 9z" />,
  location: (
    <>
      <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  external: <path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h5" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  logout: <path d="M9 4H6a1 1 0 00-1 1v14a1 1 0 001 1h3M14 8l4 4-4 4M18 12H9" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = 'icon-inline' }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

export default Icon;
