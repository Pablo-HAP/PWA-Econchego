const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api'

type FieldIssue = { field: string; message: string }
type FieldErrors = Record<string, string>
type ApiErrorPayload = { message?: string; issues?: FieldIssue[] }

const FALLBACK_MESSAGE = 'Não foi possível concluir. Tente novamente.'
const NETWORK_MESSAGE = 'Sem conexão com o servidor. Verifique sua internet e tente de novo.'

class ApiRequestError extends Error {
  status: number
  issues: FieldIssue[]

  constructor(message: string, status: number, issues: FieldIssue[] = []) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.issues = issues
  }
}

// O token e o aviso de sessão expirada ficam aqui para os hooks não precisarem repassá-los.
let authToken: string | null = null
let onUnauthorized: (() => void) | null = null

const setAuthToken = (token: string | null) => {
  authToken = token
}

const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        // O Fastify recusa Content-Type JSON com corpo vazio, então só enviamos quando há corpo.
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers ?? {}),
      },
    })
  } catch {
    throw new ApiRequestError(NETWORK_MESSAGE, 0)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const payload = (await response.json().catch(() => null)) as (ApiErrorPayload & T) | null

  if (!response.ok) {
    // 401 com token enviado = sessão expirada. Login com senha errada não entra aqui (não há token).
    if (response.status === 401 && authToken) {
      onUnauthorized?.()
    }
    throw new ApiRequestError(payload?.message ?? FALLBACK_MESSAGE, response.status, payload?.issues ?? [])
  }

  return payload as T
}

const body = (data?: unknown) => (data === undefined ? undefined : JSON.stringify(data))

const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) => request<T>(path, { method: 'POST', body: body(data) }),
  put: <T>(path: string, data?: unknown) => request<T>(path, { method: 'PUT', body: body(data) }),
  patch: <T>(path: string, data?: unknown) => request<T>(path, { method: 'PATCH', body: body(data) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : FALLBACK_MESSAGE)

// Transforma "issues" do Zod em { campo: mensagem } (uma mensagem por campo).
const getFieldErrors = (error: unknown): FieldErrors => {
  const errors: FieldErrors = {}

  if (error instanceof ApiRequestError) {
    for (const issue of error.issues) {
      if (issue.field && !errors[issue.field]) {
        errors[issue.field] = issue.message
      }
    }
  }

  return errors
}

export { API_URL, ApiRequestError, api, getErrorMessage, getFieldErrors, setAuthToken, setUnauthorizedHandler }
export type { FieldErrors }
