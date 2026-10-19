// An original, simplified star-and-cross study inspired by Moroccan zellige.
// Kept inline and decorative: no images, scripts, animation, or external requests.
export function HeroZellige() {
  return <svg className="hero-pattern" width="100%" height="100%" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <pattern id="hero-zellige" width="112" height="112" viewBox="0 0 80 80" patternUnits="userSpaceOnUse">
        <path className="zellige-star" d="M40 4 50.5 14.5 65.5 14.5 65.5 29.5 76 40 65.5 50.5 65.5 65.5 50.5 65.5 40 76 29.5 65.5 14.5 65.5 14.5 50.5 4 40 14.5 29.5 14.5 14.5 29.5 14.5Z" />
        <path className="zellige-joints" d="M0 24 24 0M56 0 80 24M80 56 56 80M24 80 0 56" />
        <path className="zellige-center" d="m40 28 12 12-12 12-12-12Z" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hero-zellige)" />
  </svg>;
}

export function HeroTitleMark() {
  return <svg className="hero-title-mark" viewBox="0 0 160 24" fill="none" aria-hidden="true" focusable="false">
    <path d="M0 12h61m38 0h61M80 1l3 4 5-.8-.8 5L91 12l-3.8 2.8.8 5-5-.8-3 4-3-4-5 .8.8-5L69 12l3.8-2.8-.8-5 5 .8Z" stroke="currentColor" />
    <path d="m80 8 4 4-4 4-4-4Z" fill="currentColor" />
  </svg>;
}


