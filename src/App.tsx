import { useState, useEffect } from 'react';
import Landing from './components/Landing';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import { UserRole } from './types';

const STORAGE_KEY = 'hostel_tracker_role';

function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedRole = localStorage.getItem(STORAGE_KEY);
    if (savedRole === 'student' || savedRole === 'admin') {
      setUserRole(savedRole);
    }
    setLoading(false);
  }, []);

  const handleSelectRole = (role: UserRole) => {
    setUserRole(role);
    if (role) {
      localStorage.setItem(STORAGE_KEY, role);
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!userRole) {
    return <Landing onSelectRole={handleSelectRole} />;
  }

  if (userRole === 'student') {
    return <StudentDashboard onLogout={handleLogout} />;
  }

  if (userRole === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return null;
}

export default App;
