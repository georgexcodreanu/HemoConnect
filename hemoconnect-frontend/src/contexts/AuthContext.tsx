import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  role: string | null;
  firstName: string | null;
  lastName: string | null;
  entityName: string | null;
  donorProfile: any | null;
  logout: () => Promise<void>;
  loading: boolean;
  setRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [entityName, setEntityName] = useState<string | null>(null);
  const [donorProfile, setDonorProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider useEffect mounted. Waiting for Firebase...");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Firebase auth state changed. User:", user ? user.uid : "null");
      
      if (!user) {
        setCurrentUser(null);
        localStorage.removeItem('role');
        setRole(null);
        setFirstName(null);
        setLastName(null);
        setEntityName(null);
        setDonorProfile(null);
        setLoading(false);
        return;
      }

      if (!user.emailVerified) {
        console.warn("User has not verified email! Signing out automatically.");
        await firebaseSignOut(auth);
        setCurrentUser(null);
        localStorage.removeItem('role');
        setRole(null);
        setFirstName(null);
        setLastName(null);
        setEntityName(null);
        setDonorProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true); // <--- AICI ESTE FIX-UL VITAL PENTRU A OPRI FLICKER-UL (LOOP-UL DE REDIRECT)
      setCurrentUser(user);
      
      try {
        const token = await user.getIdToken();
        const response = await fetch('https://localhost:7129/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setRole(data.role);
          setFirstName(data.firstName || null);
          setLastName(data.lastName || null);
          setEntityName(data.entityName || null);
          setDonorProfile(data.donorProfile || null);
          localStorage.setItem('role', data.role);
        } else {
          console.error("Could not fetch user role from backend.");
        }
      } catch (err) {
        console.error("Error fetching role:", err);
      }

      setLoading(false);
    }, (error) => {
      console.error("Firebase auth error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSetRole = (newRole: string) => {
    setRole(newRole);
    localStorage.setItem('role', newRole);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setRole(null);
    setFirstName(null);
    setLastName(null);
    setEntityName(null);
    setDonorProfile(null);
    localStorage.removeItem('role');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
        <h2>Se încarcă autentificarea...</h2>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated: !!currentUser, 
      role, 
      firstName,
      lastName,
      entityName,
      donorProfile,
      logout, 
      loading,
      setRole: handleSetRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
