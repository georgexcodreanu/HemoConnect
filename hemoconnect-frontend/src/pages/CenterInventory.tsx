import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

function CenterInventory() {
  const { entityName, currentUser } = useAuth();
  
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch('https://localhost:7129/api/bloodbag/center', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [currentUser]);

  const getBloodTypeString = (bt: string, rh: string) => {
    return `${bt === '0' ? 'O' : bt === '1' ? 'A' : bt === '2' ? 'B' : 'AB'}${rh === '0' ? '+' : '-'}`;
  };

  // Grouping inventory
  const aggregatedStock: Record<string, { total: number, available: number, allocated: number }> = {};
  
  inventory.forEach(bag => {
    const key = getBloodTypeString(bag.bloodType.toString(), bag.rhFactor.toString());
    if (!aggregatedStock[key]) {
      aggregatedStock[key] = { total: 0, available: 0, allocated: 0 };
    }
    aggregatedStock[key].total++;
    if (bag.status === 0) aggregatedStock[key].available++;
    else aggregatedStock[key].allocated++;
  });

  return (
    <DashboardLayout backgroundImage="/backgrounds/stoc.jpg">
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Inventar Sânge</h1>

        <div className="bento-card table-container">
          <h2 className="table-header" style={{ margin: 0 }}>Rezumat Stoc pe Grupe Sanguine</h2>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Se încarcă inventarul...</div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Grupa Sanguină</th>
                    <th>Stoc Total (Pungi)</th>
                    <th>Disponibile (Liber)</th>
                    <th>Alocate (Rezervate)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(aggregatedStock).length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Nu există stoc.</td></tr>
                  ) : (
                    Object.keys(aggregatedStock).map(key => (
                      <tr key={key} className="table-row">
                        <td><span className="blood-type-pill" style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}>{key}</span></td>
                        <td style={{ fontWeight: 600, fontSize: '1.2rem' }}>{aggregatedStock[key].total}</td>
                        <td style={{ color: '#10b981', fontWeight: 600, fontSize: '1.2rem' }}>{aggregatedStock[key].available}</td>
                        <td style={{ color: '#ef4444', fontWeight: 600, fontSize: '1.2rem' }}>{aggregatedStock[key].allocated}</td>
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

export default CenterInventory;
