// Formas soltas inspiradas nos slides (triângulo, círculo, laço). Trocar pelos SVGs oficiais quando houver.
const shape = 'absolute fill-none stroke-current'

const Decoration = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <svg viewBox="0 0 100 100" className={`${shape} -left-4 top-8 size-24 rotate-12 text-brand-olive/25`} strokeWidth="9" strokeLinejoin="round">
      <path d="M12 20 L88 32 L40 88 Z" />
    </svg>
    <svg viewBox="0 0 100 100" className={`${shape} -right-6 top-40 size-20 text-brand-orange/30`} strokeWidth="11">
      <circle cx="50" cy="50" r="28" />
    </svg>
    <svg viewBox="0 0 120 80" className={`${shape} -bottom-2 -left-6 h-24 w-36 text-brand-coral/25`} strokeWidth="10" strokeLinecap="round">
      <path d="M10 60 C30 5 80 5 70 45 C65 70 30 60 55 35 C80 10 110 30 112 55" />
    </svg>
    <svg viewBox="0 0 100 100" className={`${shape} -bottom-4 right-6 size-24 -rotate-12 text-brand-olive/25`} strokeWidth="9" strokeLinejoin="round">
      <path d="M15 25 L85 18 L55 85 Z" />
    </svg>
  </div>
)

export { Decoration }
