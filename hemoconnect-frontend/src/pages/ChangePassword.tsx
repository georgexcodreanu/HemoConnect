import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { validatePassword } from '../utils/validation';

function ChangePassword() {
  const { currentUser } = useAuth();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Parolele noi nu se potrivesc!' });
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setMessage({ type: 'error', text: passwordError });
      return;
    }

    if (!currentUser || !currentUser.email) {
      setMessage({ type: 'error', text: 'Eroare de sesiune. Te rugăm să te reloghezi.' });
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);

      setMessage({ type: 'success', text: 'Parola a fost schimbată cu succes!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Parola curentă este incorectă.' });
      } else if (error.code === 'auth/too-many-requests') {
        setMessage({ type: 'error', text: 'Prea multe încercări eșuate. Încearcă mai târziu.' });
      } else {
        setMessage({ type: 'error', text: 'A apărut o eroare la schimbarea parolei.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout backgroundImage="/backgrounds/programari.jpg">
      <div style={{ padding: '2rem', maxWidth: '600px' }}>
        
        <Link to="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-accent)', textDecoration: 'none', fontWeight: 600, marginBottom: '2rem' }}>
          <span>←</span> Înapoi la Profil
        </Link>

        <h1 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Securitate și Parolă</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Actualizează parola pentru a-ți menține contul în siguranță.</p>

        <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {message && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.type === 'success' ? '#10b981' : '#ef4444',
              border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Parola Curentă</label>
              <input 
                type="password" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>
            
            <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }}></div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Noua Parolă</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                placeholder="Minim 6 caractere"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Confirmare Noua Parolă</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              style={{
                padding: '1rem',
                background: 'var(--primary-accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: '0.5rem'
              }}
            >
              {loading ? 'Se actualizează...' : 'Schimbă Parola'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ChangePassword;
