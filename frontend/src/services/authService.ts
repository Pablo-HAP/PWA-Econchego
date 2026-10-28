import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from '@/types/auth'
import { api } from './api'

const signIn = (input: LoginInput) => api.post<AuthResponse>('/auth/login', input)

const signUp = (input: RegisterInput) => api.post<AuthResponse>('/auth/register', input)

const fetchMe = async () => (await api.get<{ user: AuthUser }>('/auth/me')).user

export { fetchMe, signIn, signUp }
