import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import UrgencyBadge from '../components/UrgencyBadge';

function AdminDispatcher() {
  const { currentUser } = useAuth();
  
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch('https://localhost:7129/api/bloodrequests/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, [currentUser]);

  const handleTriggerAlgorithm = async () => {
    setTriggering(true);
    setMessage(null);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch('https://localhost:7129/api/bloodrequests/trigger-allocation', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchAllRequests(); // refresh table
      } else {
        setMessage({ type: 'error', text: data.message || 'Eroare la rularea algoritmului.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Eroare de rețea.' });
    } finally {
      setTriggering(false);
    }
  };

  const getBloodTypeString = (bt: number, rh: number) => {
    const types = ['O', 'A', 'B', 'AB'];
    const rhs = ['+', '-', '?'];
    return `${types[bt] ?? '?'}${rhs[rh] ?? ''}`;
  };

  return (
    <DashboardLayout backgroundImage="/backgrounds/expediere.jpg">
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Dispecerat Național de Alocare</h1>

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

        {/* Algorithm Trigger Card */}
        <div className="bento-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.9) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: 'var(--primary-accent)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Alocare Inteligentă a Resurselor</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem', maxWidth: '600px' }}>
                Algoritmul procesează cererile în așteptare și alocă stocurile disponibile pe baza scorului de prioritate calculat inteligent.
              </p>
            </div>
            <button 
              onClick={handleTriggerAlgorithm}
              disabled={triggering}
              style={{
                padding: '0.8rem 1.5rem',
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                transition: 'transform 0.2s',
                opacity: triggering ? 0.7 : 1,
                whiteSpace: 'nowrap'
              }}
            >
              {triggering ? 'Se procesează...' : 'Rulează Algoritmul'}
            </button>
          </div>
        </div>

        {/* Global Requests Table */}
        <div className="bento-card table-container">
          <h2 className="table-header" style={{ margin: 0 }}>Toate Cererile din Spitale</h2>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Se încarcă cererile...</div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Spital Destinație</th>
                    <th>Sânge</th>
                    <th>Cantitate</th>
                    <th>Urgență (Scor Algoritm)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Nu există cereri în sistem.</td></tr>
                  ) : (
                    requests.map(req => (
                      <tr key={req.id} className="table-row">
                        <td style={{ fontWeight: 600 }}>{req.hospitalName}</td>
                        <td><span className="blood-type-pill">{getBloodTypeString(req.bloodType, req.rhFactor)}</span></td>
                        <td>{req.requiredQuantity} pungi</td>
                        <td>
                          <UrgencyBadge level={req.urgencyLevel} />
                          <div style={{ fontSize: '0.8rem', color: 'var(--primary-accent)', marginTop: '0.3rem', fontWeight: 600 }}>
                            Scor: {req.priorityScore}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            (Medic: {req.patientSeverityScore}/10)
                          </div>
                        </td>
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
    </DashboardLayout>
  );
}

export default AdminDispatcher;
