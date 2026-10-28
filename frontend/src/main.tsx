import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { ApiRequestError, getErrorMessage } from './services/api'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // 401 já é tratado pelo AuthContext (aviso e saída da conta)
      if (error instanceof ApiRequestError && error.status === 401) return
      toast.error(getErrorMessage(error))
    },
  }),
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60_000 },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
