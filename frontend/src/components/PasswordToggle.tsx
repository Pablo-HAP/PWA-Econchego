import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PasswordToggleProps = { visible: boolean; onToggle: () => void }

const PasswordToggle = ({ visible, onToggle }: PasswordToggleProps) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    onClick={onToggle}
    aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
    aria-pressed={visible}
  >
    {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
  </Button>
)

export { PasswordToggle }
