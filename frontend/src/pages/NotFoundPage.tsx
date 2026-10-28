import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'

const NotFoundPage = () => (
  <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
    <Logo size="lg" />
    <h1 className="text-2xl font-extrabold">Página não encontrada</h1>
    <p className="max-w-xs text-muted-foreground">O endereço pode estar errado ou a página mudou de lugar.</p>
    <Button asChild size="lg">
      <Link to="/home">Voltar ao início</Link>
    </Button>
  </div>
)

export { NotFoundPage }
