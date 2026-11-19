import { Navigate, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import PageContainer from './components/PageContainer'
import RequireRole from './components/RequireRole'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VehiclesPage from './pages/VehiclesPage'
import ServiceRequestsPage from './pages/ServiceRequestsPage'
import VisitsPage from './pages/VisitsPage'
import InvoicesPage from './pages/InvoicesPage'
import InvoiceViewPage from './pages/InvoiceViewPage'
import AdminLayout from './components/admin/AdminLayout'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminCatalogPage from './pages/AdminCatalogPage'
import AdminPartsPage from './pages/AdminPartsPage'
import NotFoundPage from './pages/NotFoundPage'
import UiPreviewPage from './pages/UiPreviewPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />

        <Route element={<PageContainer />}>
          <Route path="services" element={<CatalogPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="ui-preview" element={<UiPreviewPage />} />

          <Route element={<RequireRole allowedRoles={['CUSTOMER', 'ADMIN']} />}>
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="service-requests" element={<ServiceRequestsPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['CUSTOMER', 'ADMIN', 'MECHANIC']} />}>
            <Route path="visits" element={<VisitsPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['CUSTOMER', 'ADMIN']} />}>
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="invoices/:id" element={<InvoiceViewPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['ADMIN']} />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/users" replace />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="catalog" element={<AdminCatalogPage />} />
              <Route path="parts" element={<AdminPartsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
