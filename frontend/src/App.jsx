import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TestList from './components/tests/TestList';
import TestDetails from './components/tests/TestDetails';
import ExamWindow from './components/exam/ExamWindow';
import ResultSheet from './components/results/ResultSheet';
import StudentLogin from './components/auth/StudentLogin';
import StudentRegister from './components/auth/StudentRegister';
import Navbar from './components/Navbar';
import { AuthProvider, AuthContext } from './security/AuthContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="content-area">
            <Routes>
              <Route path="/login" element={<StudentLogin />} />
              <Route path="/register" element={<StudentRegister />} />
              <Route path="/" element={<ProtectedRoute><TestList /></ProtectedRoute>} />
              <Route path="/test-details/:testId" element={<ProtectedRoute><TestDetails /></ProtectedRoute>} />
              <Route path="/exam/:testId" element={<ProtectedRoute><ExamWindow /></ProtectedRoute>} />
              <Route path="/results" element={<ProtectedRoute><ResultSheet /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
