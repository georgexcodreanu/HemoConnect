import React from 'react';
import UrgencyBadge from './UrgencyBadge';
import './components.css';

interface RequestDto {
  requestId: number;
  hospitalName: string;
  bloodType: number; // Enum value
  rhFactor: number; // Enum value
  requiredQuantity: number;
  urgencyLevel: number; // 1, 2, 3
  patientSeverityScore: number;
  priorityScore: number;
}

interface RequestsTableProps {
  requests: RequestDto[];
  loading: boolean;
}

const getBloodTypeString = (bt: number, rh: number) => {
  const types = ['O', 'A', 'B', 'AB'];
  const rhs = ['+', '-'];
  return `${types[bt] ?? 'Unknown'}(${rhs[rh] ?? ''})`;
};

const RequestsTable: React.FC<RequestsTableProps> = ({ requests, loading }) => {
  if (loading) {
    return <div className="bento-card table-container loading">Se procesează algoritmul...</div>;
  }

  return (
    <div className="bento-card table-container">
      <h2 className="table-header">Cereri Prioritizate</h2>
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Spital</th>
              <th>Sânge Solicitat</th>
              <th>Cantitate</th>
              <th>Urgență</th>
              <th>Scor Severitate</th>
              <th>Scor Prioritate (Algoritm)</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Nu există cereri în așteptare.</td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.requestId} className="table-row">
                  <td className="fw-500">{req.hospitalName}</td>
                  <td>
                    <span className="blood-type-pill">
                      {getBloodTypeString(req.bloodType, req.rhFactor)}
                    </span>
                  </td>
                  <td>{req.requiredQuantity} unități</td>
                  <td>
                    <UrgencyBadge level={req.urgencyLevel} />
                  </td>
                  <td>{req.patientSeverityScore}/10</td>
                  <td className="score-cell">
                    {req.priorityScore.toFixed(1)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestsTable;
