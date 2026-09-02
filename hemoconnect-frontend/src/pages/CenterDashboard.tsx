import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

function CenterDashboard() {
  const { entityName, currentUser } = useAuth();
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch('https://localhost:7129/api/bloodrequests/center-tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUser]);

  const handleConfirmShipment = async (allocationId: string) => {
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch(`https://localhost:7129/api/bloodrequests/confirm-shipment/${allocationId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Expediere confirmată cu succes!' });
        fetchTasks(); // Reload tasks so the shipped one disappears
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Eroare la confirmarea expedierii.' });
    }
  };

  const getBloodTypeString = (bt: number, rh: number) => {
    const types = ['O', 'A', 'B', 'AB'];
    const rhs = ['+', '-'];
    return `${types[bt] ?? '?'}${rhs[rh] ?? ''}`;
  };

  return (
    <DashboardLayout backgroundImage="/backgrounds/expediere.jpg">
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Panou Centru de Transfuzie</h1>

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

        <div className="bento-card table-container">
          <h2 className="table-header" style={{ margin: 0, color: '#ef4444' }}>Task-uri de Expediere</h2>
          {loadingTasks ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Se caută sarcini...</div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Spital Destinație</th>
                    <th>Sânge Solicitat</th>
                    <th>Pachete (Pungi)</th>
                    <th>Data Alocării</th>
                    <th>Acțiune</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Nu există cereri alocate de algoritm pentru centrul tău.</td></tr>
                  ) : (
                    tasks.map(task => (
                      <tr key={task.requestId} className="table-row">
                        <td style={{ fontWeight: 600 }}>{task.hospitalName}</td>
                        <td><span className="blood-type-pill">{getBloodTypeString(task.bloodType, task.rhFactor)}</span></td>
                        <td style={{ fontWeight: 600, color: 'var(--primary-accent)' }}>{task.quantity} pungi</td>
                        <td>{new Date(task.allocationDate).toLocaleDateString()}</td>
                        <td>
                          <button 
                            onClick={() => handleConfirmShipment(task.requestId)}
                            style={{
                              padding: '0.4rem 0.8rem',
                              background: 'var(--primary-accent)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}>
                            Confirmă Expediere
                          </button>
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

export default CenterDashboard;
