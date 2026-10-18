// Reusable subtle zellige-pattern background overlay.
// Uses the same star-and-cross geometry as HeroZellige, with a unique
// pattern-id so multiple instances on the same page don't conflict.
// Kept purely decorative: no images, scripts, animation, or external requests.
export function ZelligeBg({ id = "zellige-bg" }: { id?: string }) {
  return <svg className="zellige-bg" width="100%" height="100%" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <pattern id={id} width="112" height="112" viewBox="0 0 80 80" patternUnits="userSpaceOnUse">
        <path className="zellige-star" d="M40 4 50.5 14.5 65.5 14.5 65.5 29.5 76 40 65.5 50.5 65.5 65.5 50.5 65.5 40 76 29.5 65.5 14.5 65.5 14.5 50.5 4 40 14.5 29.5 14.5 14.5 29.5 14.5Z" />
        <path className="zellige-joints" d="M0 24 24 0M56 0 80 24M80 56 56 80M24 80 0 56" />
        <path className="zellige-center" d="m40 28 12 12-12 12-12-12Z" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${id})`} />
  </svg>;
}
