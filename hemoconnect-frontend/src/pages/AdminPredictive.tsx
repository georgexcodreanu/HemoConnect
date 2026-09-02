import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

function AdminPredictive() {
  const { currentUser } = useAuth();
  
  const [triggeringPredictive, setTriggeringPredictive] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [predictiveReport, setPredictiveReport] = useState<string | null>(null);

  const handleTriggerPredictive = async () => {
    setTriggeringPredictive(true);
    setMessage(null);
    setPredictiveReport(null);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch('https://localhost:7129/api/admin/trigger-predictive', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setPredictiveReport(data.report);
      } else {
        setMessage({ type: 'error', text: data.message || 'Eroare la rularea algoritmului predictiv.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Eroare de rețea.' });
    } finally {
      setTriggeringPredictive(false);
    }
  };

  return (
    <DashboardLayout backgroundImage="/backgrounds/stoc.jpg">
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Analiză Predictivă Stocuri </h1>

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

        <div className="bento-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(145deg, rgba(41,30,59,0.7) 0%, rgba(23,15,42,0.9) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: '#f59e0b', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Anticipare Crize Majore</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem', maxWidth: '600px' }}>
                Algoritmul analizează tendințele de consum și stocurile actuale pentru a anticipa crizele în următoarele 7 zile, declanșând alerte preventive.
              </p>
            </div>
            <button 
              onClick={handleTriggerPredictive}
              disabled={triggeringPredictive}
              style={{
                padding: '0.8rem 1.5rem',
                background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                transition: 'transform 0.2s',
                opacity: triggeringPredictive ? 0.7 : 1,
                whiteSpace: 'nowrap'
              }}
            >
              {triggeringPredictive ? 'Se analizează...' : 'Rulează Predicția'}
            </button>
          </div>
        </div>

        {predictiveReport && (
          <div className="bento-card" style={{ padding: '2rem', border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
            <h3 style={{ color: '#f59e0b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Raportul Sistemului
            </h3>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              fontFamily: 'monospace', 
              color: 'var(--text-primary)',
              background: 'var(--bg-color)',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              lineHeight: '1.6',
              fontSize: '0.95rem'
            }}>
              {predictiveReport}
            </pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminPredictive;
