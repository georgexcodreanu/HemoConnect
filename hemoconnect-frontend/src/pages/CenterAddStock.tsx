import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

function CenterAddStock() {
  const { entityName, currentUser } = useAuth();
  
  // Form state
  const [bloodType, setBloodType] = useState('0'); // O
  const [rhFactor, setRhFactor] = useState('0'); // Positive
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleAddBag = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch('https://localhost:7129/api/bloodbag/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bloodType: parseInt(bloodType),
          rhFactor: parseInt(rhFactor),
          quantity: parseInt(quantity)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: data.message || 'Pungile au fost adăugate în inventar!' });
        setQuantity('1');
      } else {
        setMessage({ type: 'error', text: 'Eroare la adăugarea pungii.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Eroare de rețea.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout backgroundImage="/backgrounds/stoc.jpg">
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Adăugare Stoc Sânge</h1>

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

        <div className="bento-card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Adaugă în Inventar</h2>
          <form onSubmit={handleAddBag} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Grupă Sanguină</label>
              <select value={bloodType} onChange={e => setBloodType(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}>
                <option value="0">O</option>
                <option value="1">A</option>
                <option value="2">B</option>
                <option value="3">AB</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Factor Rh</label>
              <select value={rhFactor} onChange={e => setRhFactor(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}>
                <option value="0">Pozitiv (+)</option>
                <option value="1">Negativ (-)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Cantitate (Pungi)</label>
              <input type="number" min="1" max="100" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }} required />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={{
                padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem', opacity: submitting ? 0.7 : 1
              }}>
              {submitting ? 'Se salvează...' : 'Adaugă Pungă Sânge'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CenterAddStock;
