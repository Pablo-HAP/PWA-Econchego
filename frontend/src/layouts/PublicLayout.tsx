import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Decoration } from '@/components/Decoration'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/hooks/useAuth'

type FromState = { from?: { pathname?: string } } | null

const PublicLayout = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Quem já tem sessão volta para onde estava indo (ou para a Home). O redirecionamento
  // depois do login/cadastro também acontece aqui.
  if (!isLoading && isAuthenticated) {
    const from = (location.state as FromState)?.from?.pathname
    return <Navigate to={from ?? '/home'} replace />
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background px-5 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
      <Decoration />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center">
        <Logo size="lg" className="mb-6" />
        <Outlet />
      </div>
    </div>
  )
}

export { PublicLayout }
