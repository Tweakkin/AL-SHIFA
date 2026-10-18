export function Ornament({ className = "" }: { className?: string }) {
  return <span className={`ornament ${className}`} aria-hidden="true"><span /><span /></span>;
}
