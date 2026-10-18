import { notFound, permanentRedirect } from "next/navigation";
import { books } from "@/lib/books";

export const dynamicParams = false;
export function generateStaticParams() { return books.map(({ slug }) => ({ slug })); }

export default async function LegacyBookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!books.some((book) => book.slug === slug)) notFound();
  permanentRedirect(`/books/${slug}`);
}
