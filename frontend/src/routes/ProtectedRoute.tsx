import { LoaderCircle } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div role="status" className="flex min-h-dvh items-center justify-center gap-2 text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" aria-hidden />
        Carregando…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export { ProtectedRoute }
