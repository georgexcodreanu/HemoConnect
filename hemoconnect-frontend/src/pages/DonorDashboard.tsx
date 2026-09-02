import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import CalendarSelector from '../components/CalendarSelector';
import { Link } from 'react-router-dom';

function DonorDashboard() {
  const { logout, currentUser, firstName } = useAuth();

  const [data, setData] = useState<any>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Appointment Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Gender Modal State
  const [genderInput, setGenderInput] = useState('0');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await currentUser?.getIdToken();
      
      const res = await fetch('https://localhost:7129/api/donor/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
      }

      const centersRes = await fetch('https://localhost:7129/api/donor/centers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (centersRes.ok) {
        const centersData = await centersRes.json();
        setCenters(centersData);
        if (centersData.length > 0) setSelectedCenter(centersData[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchBookedSlots = async (date: string, centerId: string) => {
    if (!date || !centerId) return;
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch(`https://localhost:7129/api/donor/booked-slots?centerId=${centerId}&date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBookedSlots(await res.json());
      }
    } catch(err) {}
  };

  useEffect(() => {
    if (selectedDate && selectedCenter) {
      fetchBookedSlots(selectedDate, selectedCenter);
      setSelectedTime('');
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

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (!selectedDate || !selectedTime) {
      setMessage({ type: 'error', text: 'Te rugăm să alegi data și ora.' });
      setSubmitting(false);
      return;
    }

    try {
      const token = await currentUser?.getIdToken();
      // Construim obiectul Date local și îl transformăm în UTC
      const localDateObj = new Date(`${selectedDate}T${selectedTime}:00`);
      const utcIsoString = localDateObj.toISOString();
      
      const res = await fetch('https://localhost:7129/api/donor/appointment', {
        method: 'POST',
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
        setMessage({ type: 'success', text: 'Programare realizată cu succes! Poți verifica secțiunea Istoric.' });
        setShowModal(false);
        fetchData(); 
      } else {
        setMessage({ type: 'error', text: 'Eroare la crearea programării. Asigură-te că data selectată este validă.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Eroare de rețea.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetGender = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch('https://localhost:7129/api/donor/set-gender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gender: parseInt(genderInput) })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getBloodTypeString = (bt: number) => {
    const types = ['O (I)', 'A (II)', 'B (III)', 'AB (IV)', 'Necunoscută'];
    return types[bt] ?? 'Necunoscută';
  };

  const getRhString = (rh: number) => {
    const rhs = ['Pozitiv (+)', 'Negativ (-)', 'Necunoscut'];
    return rhs[rh] ?? 'Necunoscut';
  };

  if (loading) {
    return (
      <DashboardLayout backgroundImage="/backgrounds/programari.jpg">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Se încarcă profilul donatorului...</div>
      </DashboardLayout>
    );
  }

  // Formatting Next Eligible Date for the input 'min' attribute
  let minDateStr = '';
  if (data?.nextEligibleDate) {
    const minD = new Date(data.nextEligibleDate);
    // Convert to local time YYYY-MM-DDThh:mm
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(minD.getTime() - tzoffset)).toISOString().slice(0,10);
    minDateStr = localISOTime;
  }

  return (
    <DashboardLayout backgroundImage="/backgrounds/programari.jpg">
      {/* GENDER MODAL BLOCKER */}
      {data?.needsGender && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'var(--surface-color)', padding: '3rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Actualizare Date Medicale</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Aplicația folosește acum norme medicale reale privind perioadele de repaus (8 săptămâni pentru bărbați, 12 săptămâni pentru femei). Te rugăm să ne declari sexul tău pentru a putea dona în siguranță.</p>
            <form onSubmit={handleSetGender}>
              <select 
                value={genderInput} 
                onChange={e => setGenderInput(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}
              >
                <option value="0">Masculin</option>
                <option value="1">Feminin</option>
              </select>
              <button 
                type="submit" 
                style={{ padding: '1rem', background: 'var(--primary-accent)', color: 'white', border: 'none', borderRadius: '8px', width: '100%', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Salvează și Continuă
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>Panou Donator</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Bine ai venit, <strong style={{ color: 'var(--primary-accent)' }}>{firstName}</strong>! Aici poți vedea datele tale și stabili o nouă programare.</p>
      </div>

      {message && (
        <div style={{ 
          padding: '1rem', borderRadius: '8px', marginBottom: '2rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          {message.text}
        </div>
      )}

      {data && !data.needsGender && (
        <>
          <div className="bento-grid">
            <div className="bento-card">
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Donări Totale</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.totalDonations}</p>
            </div>
            
            <div className="bento-card">
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Grupă Sânge</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ef4444' }}>{getBloodTypeString(data.bloodType)}</p>
            </div>
            
            <div className="bento-card">
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Factor Rh</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-accent)' }}>{getRhString(data.rhFactor)}</p>
            </div>

            {!data.isEligible && (
              <div className="bento-card bento-col-span-2" style={{ background: 'rgba(245, 158, 11, 0.05)', borderLeft: '4px solid #f59e0b' }}>
                <h3 style={{ color: '#f59e0b', margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Restricție Medicală de Donare</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
                  Conform normelor medicale naționale, corpul tău are nevoie de recuperare. 
                  <strong> Motiv: </strong> {data.eligibilityReason}
                </p>
                <p style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                  Data estimată la care poți dona din nou este: {new Date(data.nextEligibleDate).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Poți totuși să te programezi în avans pentru o dată ulterioară acelei zile.
                </p>
              </div>
            )}

            {/* Smart Alert Area / Booking Area in Bento Grid */}
            <div className={`bento-card ${data.isEligible ? 'bento-col-span-2' : ''}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {data.smartAlert ? (
                <>
                  <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>Campanii și Alerte Actuale</h2>
                  <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>Alertă Inteligentă!</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}><strong>{data.smartAlert.hospitalName}</strong> {data.smartAlert.message}</p>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Pregătit să salvezi vieți?</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Fiecare donare salvează până la 3 vieți. Fă o diferență astăzi!</p>
                </>
              )}
              
              <button 
                onClick={() => setShowModal(true)}
                style={{
                  padding: '1rem 2rem',
                  background: 'var(--primary-accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                  width: 'fit-content'
                }}>
                Programează o donare
              </button>
            </div>
          </div>
        </>
      )}

      {/* Appointment Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px',
            width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Programează Donarea</h2>
            <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Alege Centrul</label>
                <select 
                  value={selectedCenter} 
                  onChange={e => setSelectedCenter(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                  required
                >
                  {centers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Alege Data</label>
                <CalendarSelector 
                  selectedDate={selectedDate} 
                  onSelect={date => setSelectedDate(date)} 
                  minDateStr={minDateStr || new Date().toISOString().slice(0,10)} 
                />
                {!data.isEligible && (
                  <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.8rem', color: '#f59e0b' }}>
                    Data trebuie să fie pe sau după {new Date(data.nextEligibleDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {selectedDate && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Alege Ora (din 5 în 5 minute)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    {generateSlots().map(slot => {
                      const isBooked = bookedSlots.includes(slot);
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
                  style={{ flex: 1, padding: '0.8rem', background: 'var(--primary-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Se trimite...' : 'Confirmă'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

export default DonorDashboard;
