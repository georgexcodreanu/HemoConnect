import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Link } from 'react-router-dom';

function ProfileSettings() {
  const { currentUser, role, donorProfile, firstName, lastName } = useAuth();

  const getRoleDisplayName = (r: string | null) => {
    switch (r) {
      case 'Donor': return 'Donator Sânge';
      case 'MedicalStaff': return 'Cadru Medical';
      case 'Admin': return 'Administrator Sistem';
      default: return 'Utilizator';
    }
  };

  const getBloodTypeString = (bloodType: number | undefined) => {
    switch (bloodType) {
      case 0: return 'O (I)';
      case 1: return 'A (II)';
      case 2: return 'B (III)';
      case 3: return 'AB (IV)';
      default: return 'Necunoscut';
    }
  };

  const getRhFactorString = (rhFactor: number | undefined) => {
    switch (rhFactor) {
      case 0: return 'Pozitiv (+)';
      case 1: return 'Negativ (-)';
      default: return 'Necunoscut';
    }
  };

  const calculateAge = (dob: string | undefined) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <DashboardLayout backgroundImage="/backgrounds/programari.jpg">
      <div style={{ padding: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}>Profilul Meu</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', textAlign: 'center' }}>Vizualizează informațiile contului și datele tale medicale.</p>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          {/* Card Detalii Cont (Toți Userii) */}
          <div style={{ flex: '1 1 300px', maxWidth: '500px', background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
            
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-accent)', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '2rem', fontWeight: 600, margin: '0 auto 1rem auto' 
              }}>
                {firstName ? firstName[0] : ''}{lastName ? lastName[0] : ''}
              </div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>
                {firstName || lastName ? `${lastName} ${firstName}` : 'Nume Necompletat'}
              </h3>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Adresa de Email</label>
              <div style={{ color: 'var(--text-primary)', fontWeight: 500, padding: '0.8rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {currentUser?.email}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tip Cont (Rol)</label>
              <div style={{ 
                display: 'inline-block',
                color: 'var(--primary-accent)', 
                fontWeight: 600, 
                padding: '0.4rem 1rem', 
                background: 'rgba(59, 130, 246, 0.1)', 
                borderRadius: '20px', 
                border: '1px solid rgba(59, 130, 246, 0.2)' 
              }}>
                {getRoleDisplayName(role)}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <Link 
                to="/change-password"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.8rem',
                  background: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--primary-accent)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'var(--primary-accent)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'var(--bg-color)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                Modifică Parola
              </Link>
            </div>
          </div>

          {/* Card Detalii Medicale (Doar Donatori) */}
          {role === 'Donor' && donorProfile && (
            <div style={{ flex: '2 1 400px', background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Profil Medical
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                
                <div style={{ background: 'var(--bg-color)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Grupa Sanguină</label>
                  <div style={{ color: '#ef4444', fontSize: '1.8rem', fontWeight: 800 }}>
                    {getBloodTypeString(donorProfile.bloodType)}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-color)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Factor Rh</label>
                  <div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>
                    {getRhFactorString(donorProfile.rhFactor)}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-color)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Vârsta</label>
                  <div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>
                    {calculateAge(donorProfile.dateOfBirth)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>ani</span>
                  </div>
                </div>



              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProfileSettings;
