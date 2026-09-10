import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import RoleSelect from './pages/auth/RoleSelect';
import StudentSignup from './pages/auth/StudentSignup';
import TeacherSignup from './pages/auth/TeacherSignup';
import Login from './pages/auth/Login';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import TopicsList from './pages/dashboard/lesson/TopicsList';
import Lesson from './pages/dashboard/lesson/Lesson';
import LessonComplete from './pages/dashboard/lesson/LessonComplete';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<RoleSelect />} />
        <Route path="/signup/student" element={<StudentSignup />} />
        <Route path="/signup/teacher" element={<TeacherSignup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/student" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher" element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/topics/:subject" element={
          <ProtectedRoute>
            <TopicsList />
          </ProtectedRoute>
        } />
        <Route path="/lesson/:topicId" element={
          <ProtectedRoute>
            <Lesson />
          </ProtectedRoute>
        } />
        <Route path="/lesson/:topicId/quiz" element={
          <ProtectedRoute>
            <LessonComplete />
          </ProtectedRoute>
        } />
        <Route path="/lesson/:topicId/complete" element={
          <ProtectedRoute>
            <LessonComplete />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;