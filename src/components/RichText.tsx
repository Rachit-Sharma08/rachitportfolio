// Renders trusted, admin-authored markdown. `html` must come from
// src/lib/markdown.ts, which sanitises the output — do not pass raw strings.
export default function RichText({
  html,
  className = '',
}: {
  html: string
  className?: string
}) {
  return (
    <div
      className={`rich-text ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
