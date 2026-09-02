import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { validatePassword } from '../utils/validation';

function AdminStaff() {
  const { currentUser } = useAuth();
  
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);

  // States for Staff Creation
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staffRole, setStaffRole] = useState('HospitalStaff');
  const [entityId, setEntityId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchData = async () => {
    try {
      const resH = await fetch('https://localhost:7129/api/admin/hospitals');
      const dataH = await resH.json();
      setHospitals(dataH);
      
      const resC = await fetch('https://localhost:7129/api/admin/centers');
      const dataC = await resC.json();
      setCenters(dataC);

      if (staffRole === 'HospitalStaff' && dataH.length > 0) setEntityId(dataH[0].id.toString());
      if (staffRole === 'CenterStaff' && dataC.length > 0) setEntityId(dataC[0].id.toString());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (staffRole === 'HospitalStaff' && hospitals.length > 0) setEntityId(hospitals[0].id.toString());
    if (staffRole === 'CenterStaff' && centers.length > 0) setEntityId(centers[0].id.toString());
  }, [staffRole, hospitals, centers]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setMessage({ type: 'error', text: passwordError });
      setLoading(false);
      return;
    }

    try {
      const token = await currentUser?.getIdToken();
      const response = await fetch('https://localhost:7129/api/auth/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          email, 
          password, 
          role: staffRole, 
          entityId: parseInt(entityId) 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Cont de angajat creat cu succes!' });
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Eroare la crearea contului.' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Eroare de rețea.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout backgroundImage="/backgrounds/personal.jpg">
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Gestiune Personal</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Creează conturi securizate pentru personalul spitalelor și centrelor de transfuzie.</p>

        {message && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '2rem',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? '#10b981' : '#ef4444',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}>
            {message.text}
          </div>
        )}

        <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Formular Înregistrare Angajat
          </h2>

          <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Tip Angajat</label>
                <select 
                  value={staffRole} 
                  onChange={(e) => setStaffRole(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                >
                  <option value="HospitalStaff">Medic (Spital)</option>
                  <option value="CenterStaff">Personal (Centru Transfuzie)</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Alege Locația (Dinamica)</label>
                <select 
                  value={entityId} 
                  onChange={(e) => setEntityId(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                  required
                >
                  {staffRole === 'HospitalStaff' 
                    ? hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)
                    : centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  }
                </select>
              </div>
            </div>

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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email Angajat</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Parolă Inițială</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading || !entityId}
              style={{
                padding: '1rem',
                background: 'var(--primary-accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: (loading || !entityId) ? 'not-allowed' : 'pointer',
                opacity: (loading || !entityId) ? 0.7 : 1,
                marginTop: '0.5rem'
              }}
            >
              {loading ? 'Se procesează...' : 'Creare Angajat'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminStaff;
