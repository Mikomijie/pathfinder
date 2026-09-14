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
import Quiz from './pages/dashboard/lesson/Quiz';
import LessonComplete from './pages/dashboard/lesson/LessonComplete';
import Flashcards from './pages/dashboard/flashcards/Flashcards';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<RoleSelect />} />
        <Route path="/signup/student" element={<StudentSignup />} />
        <Route path="/signup/teacher" element={<TeacherSignup />} />
        <Route path="/login" element={<Login />} />

        {/* STUDENT DASHBOARD */}
        <Route path="/dashboard/student" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        {/* TEACHER DASHBOARD */}
        <Route path="/dashboard/teacher" element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        } />

        {/* TOPICS LIST */}
        <Route path="/topics/:subject" element={
          <ProtectedRoute>
            <TopicsList />
          </ProtectedRoute>
        } />

        {/* LESSON */}
        <Route path="/lesson/:topicId" element={
          <ProtectedRoute>
            <Lesson />
          </ProtectedRoute>
        } />

        {/* QUIZ */}
        <Route path="/lesson/:topicId/quiz" element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        } />

        {/* LESSON COMPLETE */}
        <Route path="/lesson/:topicId/complete" element={
          <ProtectedRoute>
            <LessonComplete />
          </ProtectedRoute>
        } />

        {/* FLASHCARDS */}
        <Route path="/flashcards/:topicId" element={
          <ProtectedRoute>
            <Flashcards />
          </ProtectedRoute>
        } />

        {/* CATCH ALL — redirect to landing */}
        <Route path="*" element={<Landing />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;