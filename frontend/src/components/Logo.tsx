import { cn } from '@/lib/utils'

// Wordmark provisório, com as cores das letras da logo. Trocar por <img src="/logo.svg"> quando o arquivo existir.
const LETTERS = [
  ['E', 'text-brand-olive'],
  ['C', 'text-brand-olive'],
  ['O', 'text-brand-olive'],
  ['N', 'text-brand-orange'],
  ['C', 'text-brand-coral'],
  ['H', 'text-brand-blue'],
  ['E', 'text-brand-orange'],
  ['G', 'text-brand-coral'],
  ['O', 'text-brand-blue'],
] as const

type LogoProps = { size?: 'sm' | 'lg'; className?: string }

const Logo = ({ size = 'sm', className }: LogoProps) => (
  <div
    role="img"
    aria-label="Econchego"
    className={cn('flex select-none font-black', size === 'lg' ? 'text-5xl' : 'text-2xl', className)}
  >
    {LETTERS.map(([letter, color], index) => (
      <span key={index} aria-hidden className={color}>
        {letter}
      </span>
    ))}
  </div>
)

export { Logo }
