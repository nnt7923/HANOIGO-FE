import { LogOut, MapPin } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { Avatar } from '../ui/Avatar'
import './AppLayout.css'
import { navigation } from './navigation'

export function AppLayout() {
  const { user, logout, bootstrapping } = useAuth()
  const visibleNav = navigation.filter(
    (item) => !item.auth || (user && (!item.roles || item.roles.includes(user.role))),
  )

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <Link className="brand" to="/discover">
          <div className="brand-mark">
            <MapPin size={20} />
          </div>
          <div>
            <strong>HanoiGo</strong>
            <span>Map your Hanoi</span>
          </div>
        </Link>

        <nav className="nav-list" aria-label="Primary">
          {visibleNav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                key={item.path}
                to={item.path}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="session-panel">
          {bootstrapping ? (
            <span className="muted">Loading session</span>
          ) : user ? (
            <>
              <div className="session-user">
                <Avatar name={user.name} src={user.avatarUrl} />
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.role}</span>
                </div>
              </div>
              <button className="icon-button" onClick={logout} title="Logout" type="button">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <div className="guest-actions">
              <Link className="primary-button" to="/login">
                Login
              </Link>
              <Link className="ghost-button" to="/register">
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="main-surface">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
