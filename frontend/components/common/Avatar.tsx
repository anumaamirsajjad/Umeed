interface AvatarProps {
  size?: 'sm' | 'lg';
}

// Sage-to-clay gradient "U" avatar — used in the chat header and next to
// each assistant bubble.
export function Avatar({ size = 'lg' }: AvatarProps) {
  const dims = size === 'lg' ? 'h-11 w-11 text-lg' : 'h-8 w-8 text-sm';
  return (
    <div
      className={`${dims} shrink-0 rounded-pill bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center font-display font-bold text-white`}
      aria-hidden="true"
    >
      U
    </div>
  );
}

export default Avatar;
