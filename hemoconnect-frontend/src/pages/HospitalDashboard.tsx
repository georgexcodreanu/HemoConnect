import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import UrgencyBadge from '../components/UrgencyBadge';

function HospitalDashboard() {
  const { entityName, currentUser } = useAuth();
  
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // Form state
  const [bloodType, setBloodType] = useState('0'); // O
  const [rhFactor, setRhFactor] = useState('0'); // Positive
  const [quantity, setQuantity] = useState('1');
  const [severity, setSeverity] = useState('5');
  const [urgency, setUrgency] = useState('1'); // Routine
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const fetchRequests = async () => {
    setLoadingList(true);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch('https://localhost:7129/api/bloodrequests/hospital', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const token = await currentUser?.getIdToken();
      const payload = {
        bloodType: parseInt(bloodType),
        rhFactor: parseInt(rhFactor),
        requiredQuantity: parseInt(quantity),
        patientSeverityScore: parseInt(severity),
        urgencyLevel: parseInt(urgency)
      };

      const res = await fetch('https://localhost:7129/api/bloodrequests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Cererea a fost trimisă cu succes!' });
        fetchRequests(); // Refresh table
        setQuantity('1');
        setSeverity('5');
      } else {
        setMessage({ type: 'error', text: 'A apărut o eroare la trimiterea cererii.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Eroare de rețea.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getBloodTypeString = (bt: number, rh: number) => {
    const types = ['O', 'A', 'B', 'AB'];
    const rhs = ['+', '-', '?'];
    return `${types[bt] ?? '?'}${rhs[rh] ?? ''}`;
  };

  return (
    <DashboardLayout backgroundImage="/backgrounds/expediere.jpg">
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Panou Spital</h1>

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

        <div className="bento-grid">
          
          {/* Formular Cerere Nouă */}
          <div className="bento-card" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Formulează Cerere de Sânge</h2>
            <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Grupă</label>
                  <select value={bloodType} onChange={e => setBloodType(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}>
                    <option value="0">O</option>
                    <option value="1">A</option>
                    <option value="2">B</option>
                    <option value="3">AB</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Rh</label>
                  <select value={rhFactor} onChange={e => setRhFactor(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}>
                    <option value="0">Pozitiv (+)</option>
                    <option value="1">Negativ (-)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Cantitate Necesară (Pungi)</label>
                <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Scor Severitate Pacient (1-10)</label>
                <input type="number" min="1" max="10" value={severity} onChange={e => setSeverity(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nivel Urgență</label>
                <select value={urgency} onChange={e => setUrgency(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}>
                  <option value="1">Rutină</option>
                  <option value="2">Urgent</option>
                  <option value="3">Critic</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  padding: '1rem', background: 'var(--primary-accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem', opacity: submitting ? 0.7 : 1
                }}>
                {submitting ? 'Se trimite...' : 'Trimite Cerere la Centru'}
              </button>
            </form>
          </div>

          {/* Tabel Istoric Cereri */}
          <div className="bento-card bento-col-span-2 table-container">
            <h2 className="table-header" style={{ margin: 0 }}>Cererile Spitalului</h2>
            {loadingList ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Se încarcă...</div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Sânge</th>
                      <th>Cantitate</th>
                      <th>Urgență</th>
                      <th>Data Cererii</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Nu există cereri recente.</td></tr>
                    ) : (
                      requests.map(req => (
                        <tr key={req.id} className="table-row">
                          <td><span className="blood-type-pill">{getBloodTypeString(req.bloodType, req.rhFactor)}</span></td>
                          <td>{req.requiredQuantity} pungi</td>
                          <td><UrgencyBadge level={req.urgencyLevel} /></td>
                          <td>{new Date(req.requestDate).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ 
                                display: 'inline-block',
                                padding: '0.3rem 0.6rem', 
                                borderRadius: '4px', 
                                fontSize: '0.85rem',
                                width: 'fit-content',
                                background: req.status === 0 ? 'rgba(255, 193, 7, 0.1)' : 
                                            req.status === 1 ? 'rgba(59, 130, 246, 0.1)' : 
                                            req.status === 2 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                color: req.status === 0 ? '#fbbf24' : 
                                       req.status === 1 ? '#3b82f6' : 
                                       req.status === 2 ? '#10b981' : '#6366f1'
                              }}>
                                {req.status === 0 ? 'În Așteptare' : 
                                 req.status === 1 ? 'Alocat Parțial' : 
                                 req.status === 2 ? 'Alocat Integral' : 'Rezolvat / Expediat'}
                              </span>
                              {req.assignedCenters && req.assignedCenters.length > 0 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  Sursă: {req.assignedCenters.join(', ')}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default HospitalDashboard;
