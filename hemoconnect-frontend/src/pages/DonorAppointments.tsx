import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import CalendarSelector from '../components/CalendarSelector';

function DonorAppointments() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch('https://localhost:7129/api/donor/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        let apps = data.appointments || [];
        
        if (data.totalDonations > 0) {
          const completedAppsCount = apps.filter((a: any) => a.status === 1).length;
          if (data.totalDonations > completedAppsCount) {
            const fakeDate = data.lastDonationDate || new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString();
            apps.push({
              id: 'legacy-' + Date.now(),
              appointmentDate: fakeDate,
              centerName: 'Sistem Anterior (Istoric Importat)',
              status: 1
            });
            apps.sort((a: any, b: any) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
          }
        }
        
        setAppointments(apps);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCenters = async () => {
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch('https://localhost:7129/api/donor/centers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCenters(await res.json());
      }
    } catch(err) {}
  };

  useEffect(() => {
    fetchAppointments();
    fetchCenters();
  }, [currentUser]);

  const fetchBookedSlots = async (date: string, centerId: string) => {
    if (!date || !centerId) return;
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch(`https://localhost:7129/api/donor/booked-slots?centerId=${centerId}&date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setBookedSlots(await res.json());
    } catch(err) {}
  };

  useEffect(() => {
    if (selectedDate && selectedCenter) {
      fetchBookedSlots(selectedDate, selectedCenter);
    }
  }, [selectedDate, selectedCenter]);

  const generateSlots = () => {
    const slots = [];
    let h = 8; let m = 0;
    while (h < 13 || (h === 13 && m <= 30)) {
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      m += 5;
      if (m >= 60) { m -= 60; h++; }
    }
    return slots;
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Sigur vrei să anulezi programarea?')) return;
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch(`https://localhost:7129/api/donor/cancel-appointment/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Programarea a fost anulată cu succes.' });
        fetchAppointments();
      } else {
        setMessage({ type: 'error', text: 'Eroare la anularea programării.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Eroare de rețea.' });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter || !selectedDate || !selectedTime || !selectedAppId) return;
    setSubmitting(true);
    try {
      const token = await currentUser?.getIdToken();
      // Construim obiectul Date local și îl transformăm în UTC
      const localDateObj = new Date(`${selectedDate}T${selectedTime}:00`);
      const utcIsoString = localDateObj.toISOString();
      
      const res = await fetch(`https://localhost:7129/api/donor/appointment/${selectedAppId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          centerId: parseInt(selectedCenter),
          date: utcIsoString
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Programarea a fost modificată cu succes.' });
        setShowEditModal(false);
        fetchAppointments();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.message || 'Eroare la modificare.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Eroare de rețea.' });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (app: any) => {
    setSelectedAppId(app.id);
    const center = centers.find(c => c.name === app.centerName);
    if (center) setSelectedCenter(center.id.toString());
    
    const d = new Date(app.appointmentDate.endsWith('Z') ? app.appointmentDate : app.appointmentDate + 'Z');
    const tzoffset = d.getTimezoneOffset() * 60000;
    const localISO = new Date(d.getTime() - tzoffset).toISOString();
    
    setSelectedDate(localISO.slice(0, 10));
    setSelectedTime(localISO.slice(11, 16));
    
    setShowEditModal(true);
  };

  const getStatusString = (status: number) => {
    switch(status) {
      case 0: return <span style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>În așteptare</span>;
      case 1: return <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Finalizat</span>;
      case 2: return <span style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Anulat</span>;
      default: return 'Necunoscut';
    }
  };

  return (
    <DashboardLayout backgroundImage="/backgrounds/programari.jpg">
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Istoric Programări</h1>
        
        <div className="bento-card table-container">
          <h2 className="table-header" style={{ margin: 0 }}>Toate programările tale</h2>
          
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Se încarcă istoricul...</div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Data Programării</th>
                    <th>Centrul de Transfuzie</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Nu ai nicio programare înregistrată.</td></tr>
                  ) : (
                    appointments.map((app: any) => {
                      // Fix pentru fus orar (adaugam 'Z' daca lipseste pentru a forta parsarea ca UTC)
                      const dateStr = app.appointmentDate.endsWith('Z') ? app.appointmentDate : app.appointmentDate + 'Z';
                      return (
                        <tr key={app.id} className="table-row">
                          <td style={{ fontWeight: 600 }}>{new Date(dateStr).toLocaleString()}</td>
                          <td>{app.centerName}</td>
                          <td>{getStatusString(app.status)}</td>
                          <td>
                            {app.status === 0 && app.id.toString().indexOf('legacy') === -1 ? (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => openEditModal(app)} style={{ padding: '0.3rem 0.6rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Modifică</button>
                                <button onClick={() => handleCancel(app.id)} style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Anulează</button>
                              </div>
                            ) : '-'}
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

        {/* Edit Modal */}
        {showEditModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Modifică Programarea</h2>
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Alege Centrul</label>
                  <select required value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                    <option value="" disabled>Selectează...</option>
                    {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Alege Data</label>
                  <CalendarSelector 
                    selectedDate={selectedDate} 
                    onSelect={date => {
                      setSelectedDate(date);
                      setSelectedTime('');
                    }} 
                    minDateStr={new Date().toISOString().slice(0,10)} 
                  />
                </div>
                {selectedDate && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Alege Ora (din 5 în 5 minute)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      {generateSlots().map(slot => {
                        const isBooked = bookedSlots.includes(slot) && slot !== selectedTime;
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setSelectedTime(slot)}
                            style={{
                              padding: '0.5rem',
                              border: isSelected ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                              background: isBooked ? 'rgba(0,0,0,0.05)' : (isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-color)'),
                              color: isBooked ? 'var(--text-secondary)' : 'var(--text-primary)',
                              borderRadius: '4px',
                              cursor: isBooked ? 'not-allowed' : 'pointer',
                              opacity: isBooked ? 0.5 : 1,
                              fontWeight: isSelected ? 600 : 400
                            }}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '0.8rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>Anulează</button>
                  <button type="submit" disabled={submitting} style={{ flex: 1, padding: '0.8rem', background: 'var(--primary-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: submitting ? 0.7 : 1, fontWeight: 600 }}>
                    {submitting ? 'Se salvează...' : 'Salvează Modificarea'}
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

export default DonorAppointments;
