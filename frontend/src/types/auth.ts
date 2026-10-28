export type Role = 'USER' | 'ADMIN'

// As datas chegam como string ISO (ex.: "2027-02-25T00:00:00.000Z").
export type AuthUser = {
  id: string
  name: string
  email: string
  role: Role
  dueDate: string | null
  birthDate: string | null
  ubsReference: string | null
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  name: string
  email: string
  password: string
  consent: true
  phase: 'PREGNANT' | 'BABY'
  dueDate?: string
  birthDate?: string
  ubsReference?: string
}

export type AuthResponse = {
  accessToken: string
  user: AuthUser
}

export type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  // true enquanto o app confirma, com o servidor, a sessão salva no aparelho
  isLoading: boolean
  signIn: (input: LoginInput) => Promise<AuthUser>
  signUp: (input: RegisterInput) => Promise<AuthUser>
  signOut: () => void
}
