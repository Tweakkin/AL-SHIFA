import "../reader.css";

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  return <><noscript><style>{`.reader-shell .reader-main { visibility: visible !important; }`}</style></noscript>{children}</>;
}
