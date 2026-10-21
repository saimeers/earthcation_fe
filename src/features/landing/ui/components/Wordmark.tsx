/** Logotipo tipográfico: el nombre condensado precedido de un castillete con su pozo. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`l-display inline-flex items-end gap-1.5 text-2xl leading-none ${className ?? ''}`}>
      <svg aria-hidden="true" focusable="false" viewBox="0 0 14 22" className="h-[0.95em] w-auto">
        <path d="M1 7 L7 1 L13 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        <rect x="5" y="9" width="4" height="13" fill="var(--l-amber)" />
      </svg>
      Earthcation
    </span>
  )
}
