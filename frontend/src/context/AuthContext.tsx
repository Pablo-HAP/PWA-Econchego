import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { setAuthToken, setUnauthorizedHandler } from '@/services/api'
import { fetchMe, signIn as signInRequest, signUp as signUpRequest } from '@/services/authService'
import type { AuthContextValue, AuthResponse, AuthUser, LoginInput, RegisterInput } from '@/types/auth'

const STORAGE_KEY = 'econchego:auth-session'

type StoredSession = { user: AuthUser; accessToken: string }

const loadSession = (): StoredSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredSession) : null
  } catch {
    return null
  }
}

// Lida uma vez, antes do primeiro render, para o token já estar pronto quando as telas buscarem dados.
const initialSession = loadSession()
setAuthToken(initialSession?.accessToken ?? null)

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<StoredSession | null>(initialSession)
  const [isLoading, setIsLoading] = useState(Boolean(initialSession))

  const applySession = useCallback((next: StoredSession | null) => {
    setAuthToken(next?.accessToken ?? null)

    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }

    setSession(next)
  }, [])

  const signOut = useCallback(() => {
    applySession(null)
    // Evita que a próxima pessoa a entrar neste aparelho veja dados em cache da anterior.
    queryClient.clear()
  }, [applySession, queryClient])

  // Token vencido ou conta excluída: o api.ts avisa e a sessão é encerrada.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut()
      toast.error('Sua sessão expirou. Entre novamente.')
    })

    return () => setUnauthorizedHandler(null)
  }, [signOut])

  // Ao abrir o app, confirma a sessão salva e atualiza os dados da usuária.
  useEffect(() => {
    if (!initialSession) return

    let active = true

    fetchMe()
      .then((user) => {
        if (active) applySession({ user, accessToken: initialSession.accessToken })
      })
      .catch(() => {
        // 401 já encerra a sessão. Se foi só falta de internet, mantém a sessão salva.
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [applySession])

  const startSession = useCallback(
    (response: AuthResponse) => {
      applySession(response)
      return response.user
    },
    [applySession],
  )

  const signIn = useCallback(
    async (input: LoginInput) => startSession(await signInRequest(input)),
    [startSession],
  )

  const signUp = useCallback(
    async (input: RegisterInput) => startSession(await signUpRequest(input)),
    [startSession],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [session, isLoading, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
