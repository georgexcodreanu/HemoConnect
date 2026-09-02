import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        setError('Te rugăm să îți confirmi adresa de email înainte de a te autentifica. Verifică și folderul Spam.');
        return;
      }
      // Nu mai setăm rolul manual aici!
      // AuthContext va face automat fetch-ul către /api/auth/my-role imediat după ce detectează logarea validă
    } catch (err: any) {
      console.error(err);
      setError('Date de autentificare incorecte.');
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Te rugăm să introduci adresa de email în câmpul de mai sus pentru a reseta parola.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Un email cu instrucțiunile de resetare a parolei a fost trimis pe adresa ta. Te rugăm să verifici și folderul Spam.');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('Nu există niciun cont asociat cu această adresă de email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Adresa de email este invalidă.');
      } else {
        setError('A apărut o eroare la trimiterea emailului de resetare.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div style={{ background: 'var(--surface-color)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>Autentificare HemoConnect</h2>
        
        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              placeholder="nume@exemplu.com"
              required
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)' }}>Parolă</label>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--primary-accent)', 
                  cursor: 'pointer', 
                  fontSize: '0.9rem',
                  padding: 0
                }}
              >
                Ai uitat parola?
              </button>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit"
            style={{
              padding: '1rem',
              background: 'var(--primary-accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Conectare
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Nu ai cont?</p>
          <Link to="/register" style={{ color: 'var(--primary-accent)', textDecoration: 'none', fontWeight: 600 }}>Creează un cont de Donator</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
