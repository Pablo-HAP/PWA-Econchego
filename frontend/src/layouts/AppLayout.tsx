import { BookOpen, ClipboardCheck, House, MessageCircle, User } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/home', label: 'Início', icon: House },
  { to: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
  { to: '/checklist', label: 'Checklist', icon: ClipboardCheck },
  { to: '/duvidas', label: 'Dúvidas', icon: MessageCircle },
  { to: '/perfil', label: 'Perfil', icon: User },
]

const AppLayout = () => (
  <div className="min-h-dvh bg-background">
    <header className="sticky top-0 z-20 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center px-4">
        <Logo />
      </div>
    </header>

    <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5">
      <Outlet />
    </main>

    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-card pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-bold transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cn('rounded-full px-4 py-1 transition-colors', isActive && 'bg-primary/10')}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  </div>
)

export { AppLayout }
