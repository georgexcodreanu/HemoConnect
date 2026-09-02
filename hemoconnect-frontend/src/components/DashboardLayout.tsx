import React from 'react';
import './components.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, backgroundImage }) => {
  const { logout, role, firstName, lastName, entityName, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="app-shell">
      <div className="ambient-glow"></div>
      
      {/* Top Bar */}
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 className="text-gradient" style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
            HemoConnect
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {isAuthenticated && (
            <>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                  {firstName || lastName ? `${firstName} ${lastName}` : 'Cont Utilizator'}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  {role === 'Admin' ? 'Administrator' : 
                   role === 'Donor' ? 'Donator' : 
                   (role === 'HospitalStaff' || role === 'CenterStaff') ? (entityName || role) : role}
                </span>
              </div>
              
              <button 
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }}
                onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'transparent' }}
              >
                Ieșire
              </button>
            </>
          )}
        </div>
      </header>

      {/* Shell Body (Sidebar + Content) */}
      <div className="shell-body">
        {isAuthenticated && (
          <aside className="slim-sidebar">
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
                Acasă
              </Link>
              
              {role === 'Donor' && (
                <>
                  <Link to="/donor/dashboard" className={`sidebar-link ${isActive('/donor/dashboard') ? 'active' : ''}`}>
                    Panou Donator
                  </Link>
                  <Link to="/donor/appointments" className={`sidebar-link ${isActive('/donor/appointments') ? 'active' : ''}`}>
                    Istoric Programări
                  </Link>
                </>
              )}

              {role === 'HospitalStaff' && (
                <Link to="/hospital/requests" className={`sidebar-link ${isActive('/hospital/requests') ? 'active' : ''}`}>
                  Cereri Sânge
                </Link>
              )}

              {role === 'CenterStaff' && (
                <>
                  <Link to="/center/tasks" className={`sidebar-link ${isActive('/center/tasks') ? 'active' : ''}`}>
                    Task-uri Expediere
                  </Link>
                  <Link to="/center/add-stock" className={`sidebar-link ${isActive('/center/add-stock') ? 'active' : ''}`}>
                    Adăugare Stoc
                  </Link>
                  <Link to="/center/inventory" className={`sidebar-link ${isActive('/center/inventory') ? 'active' : ''}`}>
                    Inventar Sânge
                  </Link>
                  <Link to="/center/appointments" className={`sidebar-link ${isActive('/center/appointments') ? 'active' : ''}`}>
                    Programări Donatori
                  </Link>
                </>
              )}

              {role === 'Admin' && (
                <>
                  <Link to="/admin/dispatcher" className={`sidebar-link ${isActive('/admin/dispatcher') ? 'active' : ''}`}>
                    Dispecerat Alocări
                  </Link>
                  <Link to="/admin/predictive" className={`sidebar-link ${isActive('/admin/predictive') ? 'active' : ''}`}>
                    Analiză Predictivă
                  </Link>
                  <Link to="/admin/locations" className={`sidebar-link ${isActive('/admin/locations') ? 'active' : ''}`}>
                    Gestiune Locații
                  </Link>
                  <Link to="/admin/staff" className={`sidebar-link ${isActive('/admin/staff') ? 'active' : ''}`}>
                    Gestiune Personal
                  </Link>
                </>
              )}
            </nav>

            <div style={{ marginTop: 'auto' }}>
              <Link to="/settings" className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`}>
                Setări Cont
              </Link>
            </div>
          </aside>
        )}

        <main className="main-content" style={{
          backgroundImage: backgroundImage ? `linear-gradient(rgba(15,23,42,0.7), rgba(15,23,42,0.9)), url('${backgroundImage}')` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
