import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProtectedRoute } from './ProtectedRoute'

const AppRoutes = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route index element={<Navigate to="/login" replace />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="cadastro" element={<RegisterPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="home" element={<HomePage />} />
        <Route path="biblioteca" element={<PlaceholderPage title="Biblioteca" />} />
        <Route path="checklist" element={<PlaceholderPage title="Checklist" />} />
        <Route path="duvidas" element={<PlaceholderPage title="Dúvidas" />} />
        <Route path="perfil" element={<PlaceholderPage title="Perfil" />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)

export { AppRoutes }
