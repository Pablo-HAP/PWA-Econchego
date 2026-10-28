import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from './components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'

function App() {
  return (
    <TooltipProvider>
      <AppRoutes />
      <Toaster richColors closeButton theme="light" position="top-center" />
    </TooltipProvider>
  )
}

export default App
