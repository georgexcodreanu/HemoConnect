import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import DonorAppointments from './pages/DonorAppointments';
import AdminLocations from './pages/AdminLocations';
import AdminStaff from './pages/AdminStaff';
import ProfileSettings from './pages/ProfileSettings';
import ChangePassword from './pages/ChangePassword';
import HospitalDashboard from './pages/HospitalDashboard';
import CenterDashboard from './pages/CenterDashboard';
import CenterAddStock from './pages/CenterAddStock';
import CenterInventory from './pages/CenterInventory';
import CenterAppointments from './pages/CenterAppointments';
import HomePage from './pages/HomePage';
import AdminDispatcher from './pages/AdminDispatcher';
import AdminPredictive from './pages/AdminPredictive';

function App() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/" />} 
        />
        <Route 
          path="/settings" 
          element={!isAuthenticated ? <Navigate to="/login" /> : <ProfileSettings />} 
        />
        <Route 
          path="/change-password" 
          element={!isAuthenticated ? <Navigate to="/login" /> : <ChangePassword />} 
        />
        
        <Route 
          path="/admin/dispatcher" 
          element={!isAuthenticated ? <Navigate to="/login" /> : role === 'Admin' ? <AdminDispatcher /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/predictive" 
          element={!isAuthenticated ? <Navigate to="/login" /> : role === 'Admin' ? <AdminPredictive /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/locations" 
          element={!isAuthenticated ? <Navigate to="/login" /> : role === 'Admin' ? <AdminLocations /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/staff" 
          element={!isAuthenticated ? <Navigate to="/login" /> : role === 'Admin' ? <AdminStaff /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/" 
          element={<HomePage />} 
        />

        <Route 
          path="/donor/dashboard" 
          element={!isAuthenticated ? <Navigate to="/login" /> : role === 'Donor' ? <DonorDashboard /> : <Navigate to="/" />} 
        />
        <Route 
          path="/donor/appointments" 
          element={!isAuthenticated ? <Navigate to="/login" /> : role === 'Donor' ? <DonorAppointments /> : <Navigate to="/" />} 
        />
        <Route 
          path="/hospital/requests" 
          element={!isAuthenticated ? <Navigate to="/login" /> : role === 'HospitalStaff' ? <HospitalDashboard /> : <Navigate to="/" />} 
        />
        <Route 
          path="/center/tasks" 
          element={!isAuthenticated ? <Navigate to="/login" /> : role === 'CenterStaff' ? <CenterDashboard /> : <Navigate to="/" />} 
        />
        <Route 
          path="/center/add-stock" 
          element={!isAuthenticated ? <Navigate to="/login" /> : role === 'CenterStaff' ? <CenterAddStock /> : <Navigate to="/" />} 
        />
        <Route 
          path="/center/inventory" 
          element={!isAuthenticated ? <Navigate to="/login" /> : role === 'CenterStaff' ? <CenterInventory /> : <Navigate to="/" />} 
        />
        <Route 
          path="/center/appointments" 
          element={!isAuthenticated ? <Navigate to="/login" /> : role === 'CenterStaff' ? <CenterAppointments /> : <Navigate to="/" />} 
        />
        
        {/* Orice alta ruta invalida duce la home care va decide unde e redirectat */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
