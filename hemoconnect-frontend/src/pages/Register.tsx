import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { validatePassword } from '../utils/validation';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bloodType, setBloodType] = useState('0'); // 0=O, 1=A, 2=B, 3=AB
  const [rhFactor, setRhFactor] = useState('0'); // 0=Positive, 1=Negative
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('0'); // 0=Male, 1=Female
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Get Firebase ID Token to send to our backend
      const token = await userCredential.user.getIdToken();
      
      // Sync profile with C# Backend
      const response = await fetch('https://localhost:7129/api/auth/sync-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          bloodType: parseInt(bloodType),
          rhFactor: parseInt(rhFactor),
          dateOfBirth: new Date(dateOfBirth).toISOString(),
          gender: parseInt(gender)
        })
      });

      if (!response.ok) {
        throw new Error('Nu am putut salva profilul medical.');
      }

      setSuccess(true);
      // Firebase il logheaza automat dupa register, deci teoretic e in auth state
      // Dar ii vom da signout pentru ca vrem sa il fortam sa confirme mailul inainte sa ii dam voie in app.
      await auth.signOut();

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Acest email este deja folosit.');
      } else if (err.code === 'auth/weak-password') {
        setError('Parola este prea slabă. Alege o parolă de minim 6 caractere.');
      } else {
        setError('Eroare la crearea contului: ' + err.message);
      }
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
        <div style={{ background: 'var(--surface-color)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
          <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>Cont Creat cu Succes!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Ți-am trimis un link de confirmare pe emailul <strong>{email}</strong>. 
            Te rugăm să dai click pe linkul din email pentru a activa contul.
          </p>
          <button 
            onClick={() => navigate('/login')}
            style={{
              padding: '1rem 2rem',
              background: 'var(--primary-accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer'
            }}
          >
            Spre pagina de Autentificare
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem' }}>
      <div style={{ background: 'var(--surface-color)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '500px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>Înregistrare Donator Nou</h2>
        
        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nume</label>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Prenume</label>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Parolă</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Grupa Sânge</label>
              <select 
                value={bloodType} 
                onChange={e => setBloodType(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              >
                <option value="0">O (I)</option>
                <option value="1">A (II)</option>
                <option value="2">B (III)</option>
                <option value="3">AB (IV)</option>
                <option value="4">Nu cunosc</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Factor Rh</label>
              <select 
                value={rhFactor} 
                onChange={e => setRhFactor(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              >
                <option value="0">Pozitiv (+)</option>
                <option value="1">Negativ (-)</option>
                <option value="2">Nu cunosc</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Data Nașterii</label>
              <input 
                type="date" 
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Sex</label>
              <select 
                value={gender} 
                onChange={e => setGender(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              >
                <option value="0">Masculin</option>
                <option value="1">Feminin</option>
              </select>
            </div>
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
            Înregistrare
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Ai deja cont?</p>
          <Link to="/login" style={{ color: 'var(--primary-accent)', textDecoration: 'none', fontWeight: 600 }}>Autentifică-te aici</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
