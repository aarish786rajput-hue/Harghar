"use client"

/** Highlight matching text with a <mark> span */
export function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded-sm bg-primary/20 text-primary font-semibold px-0.5 not-italic"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}
