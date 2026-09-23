import type { ReactNode } from "react";

interface HighlightMatchProps {
  text: string;
  query: string;
}

// wraps every match of query inside text with <mark>
export function HighlightMatch({ text, query }: HighlightMatchProps) {
  const q = query.trim().toLowerCase();
  if (!q) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const parts: ReactNode[] = [];
  let start = 0;
  let index = lowerText.indexOf(q);

  while (index !== -1) {
    if (index > start) {
      parts.push(text.slice(start, index));
    }
    parts.push(
      <mark key={index} className="rounded-sm bg-amber-100 text-gray-800">
        {text.slice(index, index + q.length)}
      </mark>
    );
    start = index + q.length;
    index = lowerText.indexOf(q, start);
  }

  if (start < text.length) {
    parts.push(text.slice(start));
  }

  return <>{parts}</>;
}