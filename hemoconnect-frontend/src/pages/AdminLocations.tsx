import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

function AdminLocations() {
  const { currentUser } = useAuth();
  
  // States for Location Creation
  const [locName, setLocName] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locLat, setLocLat] = useState('44.4268');
  const [locLng, setLocLng] = useState('26.1025');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [hospitals, setHospitals] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const fetchLocations = async () => {
    setLoadingLists(true);
    try {
      const token = await currentUser?.getIdToken();
      
      const [hospRes, centRes] = await Promise.all([
        fetch('https://localhost:7129/api/admin/hospitals', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://localhost:7129/api/admin/centers', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (hospRes.ok) setHospitals(await hospRes.json());
      if (centRes.ok) setCenters(await centRes.json());

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [currentUser]);

  const handleCreateLocation = async (e: React.FormEvent, type: 'hospitals' | 'centers') => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = await currentUser?.getIdToken();
      const response = await fetch(`https://localhost:7129/api/admin/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: locName, 
          location: locCity, 
          latitude: parseFloat(locLat), 
          longitude: parseFloat(locLng) 
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Locație (${type === 'hospitals' ? 'Spital' : 'Centru'}) adăugată cu succes!` });
        setLocName('');
        setLocCity('');
        fetchLocations(); // Refresh lists
      } else {
        setMessage({ type: 'error', text: 'Eroare la adăugarea locației.' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Eroare de rețea.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout backgroundImage="/backgrounds/locatii.jpg">
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '1rem' }}>Gestiune Locații și Hartă Națională</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Adaugă și vizualizează Spitalele și Centrele de Transfuzie active în rețea.</p>

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Formular Adaugare */}
          <div className="bento-card" style={{ padding: '2rem', height: 'fit-content' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Adaugă Locație Nouă
            </h2>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nume Locație</label>
                <input 
                  type="text" 
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                  placeholder="Ex: Spitalul Județean"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Oraș</label>
                <input 
                  type="text" 
                  value={locCity}
                  onChange={(e) => setLocCity(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Latitudine GPS</label>
                  <input 
                    type="number" step="0.000001"
                    value={locLat}
                    onChange={(e) => setLocLat(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Longitudine GPS</label>
                  <input 
                    type="number" step="0.000001"
                    value={locLng}
                    onChange={(e) => setLocLng(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  onClick={(e) => handleCreateLocation(e, 'hospitals')}
                  disabled={loading || !locName || !locCity}
                  style={{ padding: '0.8rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  Salvează ca Spital
                </button>
                <button 
                  onClick={(e) => handleCreateLocation(e, 'centers')}
                  disabled={loading || !locName || !locCity}
                  style={{ padding: '0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  Salvează ca Centru Transfuzie
                </button>
              </div>
            </form>
          </div>

          {/* Tabele cu locatii */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="bento-card table-container">
              <h2 className="table-header" style={{ margin: 0 }}>Spitale Active ({hospitals.length})</h2>
              {loadingLists ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Se încarcă spitalele...</div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Nume Spital</th>
                        <th>Oraș</th>
                        <th>Coordonate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hospitals.map(h => (
                        <tr key={h.id} className="table-row">
                          <td style={{ fontWeight: 600 }}>{h.name}</td>
                          <td>{h.location}</td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{h.latitude}, {h.longitude}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bento-card table-container">
              <h2 className="table-header" style={{ margin: 0 }}>Centre de Transfuzie ({centers.length})</h2>
              {loadingLists ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Se încarcă centrele...</div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Nume Centru</th>
                        <th>Oraș</th>
                        <th>Coordonate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {centers.map(c => (
                        <tr key={c.id} className="table-row">
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td>{c.location}</td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.latitude}, {c.longitude}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default AdminLocations;
