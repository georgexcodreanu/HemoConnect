import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

function CenterAppointments() {
  const { entityName, currentUser } = useAuth();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [historyAppointments, setHistoryAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'curente'|'istoric'>('curente');
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Modal State for "Unknown" blood type
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [bloodType, setBloodType] = useState('0');
  const [rhFactor, setRhFactor] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch('https://localhost:7129/api/donor/center-appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setAppointments(await res.json());
    } catch (err) { }
    finally { setLoading(false); }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch('https://localhost:7129/api/donor/center-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setHistoryAppointments(await res.json());
    } catch (err) { }
    finally { setHistoryLoading(false); }
  };

  useEffect(() => {
    fetchAppointments();
    fetchHistory();
  }, [currentUser]);

  const handleCompleteClick = (app: any) => {
    // Dacă grupa e necunoscută (4) sau RH-ul e necunoscut (2)
    if (app.bloodType === 4 || app.rhFactor === 2) {
      setSelectedAppointmentId(app.id);
      setShowModal(true);
    } else {
      // Dacă se cunosc, o finalizăm direct
      submitCompletion(app.id, false, 0, 0);
    }
  };

  const submitCompletion = async (appId: number, updateBloodType: boolean, bt: number, rh: number) => {
    setSubmitting(true);
    setMessage(null);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch(`https://localhost:7129/api/donor/complete-appointment/${appId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          updateBloodType: updateBloodType,
          bloodType: bt,
          rhFactor: rh
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Programare marcată ca finalizată!' });
        setShowModal(false);
        fetchAppointments();
        fetchHistory();
      } else {
        setMessage({ type: 'error', text: 'Eroare la finalizarea programării.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Eroare de rețea.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNoShow = async (appId: number) => {
    if (!window.confirm('Ești sigur că vrei să marchezi acest donator ca neprezentat? Această acțiune nu poate fi anulată.')) return;
    
    setSubmitting(true);
    setMessage(null);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch(`https://localhost:7129/api/donor/noshow-appointment/${appId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Programarea a fost marcată ca neprezentată.' });
        fetchAppointments();
        fetchHistory();
      } else {
        setMessage({ type: 'error', text: 'Eroare la marcarea programării.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Eroare de rețea.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAppointmentId) {
      submitCompletion(selectedAppointmentId, true, parseInt(bloodType), parseInt(rhFactor));
    }
  };

  const getBloodTypeString = (bt: number, rh: number) => {
    if (bt === 4 || rh === 2) return 'Necunoscută';
    const types = ['O', 'A', 'B', 'AB'];
    const rhs = ['+', '-'];
    return `${types[bt] ?? '?'}${rhs[rh] ?? ''}`;
  };

  return (
    <DashboardLayout backgroundImage="/backgrounds/programari.jpg">
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Programări Donatori</h1>

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

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('curente')}
            style={{ padding: '0.8rem 1.5rem', background: activeTab === 'curente' ? 'var(--primary-accent)' : 'transparent', color: activeTab === 'curente' ? 'white' : 'var(--text-secondary)', border: activeTab === 'curente' ? 'none' : '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            Programări Curente
          </button>
          <button 
            onClick={() => setActiveTab('istoric')}
            style={{ padding: '0.8rem 1.5rem', background: activeTab === 'istoric' ? 'var(--primary-accent)' : 'transparent', color: activeTab === 'istoric' ? 'white' : 'var(--text-secondary)', border: activeTab === 'istoric' ? 'none' : '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            Istoric Programări
          </button>
        </div>

        {activeTab === 'curente' ? (
          <div className="bento-card table-container">
            <h2 className="table-header" style={{ margin: 0 }}>Programări Curente (În Așteptare)</h2>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Se încarcă programările...</div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Donator</th>
                      <th>Grupă Sânge</th>
                      <th>Data și Ora</th>
                      <th>Acțiune</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Nu există programări active la acest centru.</td></tr>
                    ) : (
                      appointments.map(app => {
                        const dateStr = app.appointmentDate.endsWith('Z') ? app.appointmentDate : app.appointmentDate + 'Z';
                        return (
                        <tr key={app.id} className="table-row">
                          <td style={{ fontWeight: 600 }}>{app.donorName}</td>
                          <td>
                            {app.bloodType === 4 || app.rhFactor === 2 ? (
                              <span style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>Necunoscută</span>
                            ) : (
                              <span className="blood-type-pill">{getBloodTypeString(app.bloodType, app.rhFactor)}</span>
                            )}
                          </td>
                          <td>{new Date(dateStr).toLocaleString()}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleCompleteClick(app)}
                                style={{ padding: '0.4rem 0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                                A donat
                              </button>
                              <button 
                                onClick={() => handleNoShow(app.id)}
                                style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                                Nu s-a prezentat
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bento-card table-container">
            <h2 className="table-header" style={{ margin: 0 }}>Istoric (Efectuate / Anulate)</h2>
            {historyLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Se încarcă istoricul...</div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Donator</th>
                      <th>Grupă Sânge</th>
                      <th>Data și Ora</th>
                      <th>Status Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyAppointments.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Nu există istoric disponibil.</td></tr>
                    ) : (
                      historyAppointments.map(app => {
                        const dateStr = app.appointmentDate.endsWith('Z') ? app.appointmentDate : app.appointmentDate + 'Z';
                        return (
                        <tr key={app.id} className="table-row">
                          <td style={{ fontWeight: 600 }}>{app.donorName}</td>
                          <td>
                            {app.bloodType === 4 || app.rhFactor === 2 ? (
                              <span style={{ color: 'var(--text-secondary)' }}>N/A</span>
                            ) : (
                              <span className="blood-type-pill">{getBloodTypeString(app.bloodType, app.rhFactor)}</span>
                            )}
                          </td>
                          <td>{new Date(dateStr).toLocaleString()}</td>
                          <td>
                            {app.status === 1 ? (
                              <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Finalizat</span>
                            ) : (
                              <span style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Anulat / Neprezentat</span>
                            )}
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal Completare Date pt Donator cu Grupa Necunoscuta */}
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px',
              width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)'
            }}>
              <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Confirmare Date Medicale</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Acest donator nu are grupa de sânge completată. Te rugăm să introduci rezultatele analizelor pentru a-i actualiza profilul.
              </p>
              <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
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
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Factor Rh</label>
                  <select 
                    value={rhFactor} 
                    onChange={e => setRhFactor(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                  >
                    <option value="0">Pozitiv (+)</option>
                    <option value="1">Negativ (-)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    style={{ flex: 1, padding: '0.8rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Anulează
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    style={{ flex: 1, padding: '0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: submitting ? 0.7 : 1, fontWeight: 600 }}
                  >
                    {submitting ? 'Se salvează...' : 'Salvează și Finalizează'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CenterAppointments;
