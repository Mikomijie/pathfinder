import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import RoleSelect from './pages/auth/RoleSelect';
import StudentSignup from './pages/auth/StudentSignup';
import Login from './pages/auth/Login';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<RoleSelect />} />
        <Route path="/signup/student" element={<StudentSignup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/student" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;