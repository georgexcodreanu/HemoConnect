import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Link } from 'react-router-dom';

function HomePage() {
  const { firstName, lastName, role, entityName, isAuthenticated } = useAuth();

  return (
    <DashboardLayout backgroundImage="/backgrounds/acasa.jpg">
      <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="text-gradient" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>HemoConnect</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Sistemul Național de Gestiune și Prioritizare a Resurselor Sanguine
          </p>
        </div>

        <div className="bento-grid">
          <div className="bento-card bento-col-span-2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <h2 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.8rem' }}>
                  Bun venit, {firstName} {lastName}!
                </h2>
                
                <div style={{ 
                  display: 'inline-block',
                  padding: '0.8rem 1.5rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--primary-accent)',
                  borderRadius: '12px',
                  fontWeight: 600,
                  width: 'fit-content'
                }}>
                  {role === 'Admin' ? 'Administrator Sistem' : 
                   role === 'Donor' ? 'Donator Activ' : 
                   role === 'HospitalStaff' ? `Medic - ${entityName || 'Spital'}` :
                   role === 'CenterStaff' ? `Personal - ${entityName || 'Centru Transfuzie'}` :
                   'Utilizator'
                  }
                </div>
              </>
            ) : (
              <>
                <h2 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.8rem' }}>
                  Te rugăm să te conectezi
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
                  Pentru a accesa platforma HemoConnect trebuie să ai un cont activ.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Link 
                    to="/login"
                    style={{
                      background: 'var(--primary-accent)',
                      color: 'white',
                      padding: '0.8rem 2rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    Autentificare
                  </Link>
                  <Link 
                    to="/register"
                    style={{
                      background: 'transparent',
                      color: 'var(--primary-accent)',
                      border: '1px solid var(--primary-accent)',
                      padding: '0.8rem 2rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    Creează Cont
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default HomePage;
