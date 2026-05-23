import { Navigate, Route, Routes } from 'react-router-dom'
import { Shield, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { EmptyState } from '../components/ui/EmptyState'
import { useAuth } from '../features/auth/hooks/useAuth'
import { AdminPage } from '../pages/AdminPage'
import { CommunityPage } from '../pages/CommunityPage'
import { ItinerariesPage } from '../pages/ItinerariesPage'
import { LoginPage } from '../pages/LoginPage'
import { OwnerDashboardPage } from '../pages/OwnerDashboardPage'
import { PlacesPage } from '../pages/PlacesPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RegisterPage } from '../pages/RegisterPage'
import type { UserRole } from '../types/api.type'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate replace to="/discover" />} />
        <Route path="discover" element={<PlacesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="itineraries" element={<ItinerariesPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="owner"
          element={
            <RequireAuth>
              <OwnerDashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="admin"
          element={
            <RequireAuth roles={['admin']}>
              <AdminPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate replace to="/discover" />} />
      </Route>
    </Routes>
  )
}

function RequireAuth({
  children,
  roles,
}: {
  children: ReactNode
  roles?: UserRole[]
}) {
  const { user, bootstrapping } = useAuth()

  if (bootstrapping) {
    return <EmptyState icon={User} label="Loading session" />
  }

  if (!user) {
    return <EmptyState icon={User} label="Login required" />
  }

  if (roles && !roles.includes(user.role)) {
    return <EmptyState icon={Shield} label="Permission denied" />
  }

  return children
}
