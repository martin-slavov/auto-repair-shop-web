import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import RequireRole from './components/RequireRole'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VehiclesPage from './pages/VehiclesPage'
import AdminUsersPage from './pages/AdminUsersPage'
import NotFoundPage from './pages/NotFoundPage'
import UiPreviewPage from './pages/UiPreviewPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<CatalogPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="ui-preview" element={<UiPreviewPage />} />

        <Route element={<RequireRole allowedRoles={['CUSTOMER', 'ADMIN']} />}>
          <Route path="vehicles" element={<VehiclesPage />} />
        </Route>

        <Route element={<RequireRole allowedRoles={['ADMIN']} />}>
          <Route path="admin/users" element={<AdminUsersPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
