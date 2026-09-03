import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TestList from './components/tests/TestList';
import ExamWindow from './components/exam/ExamWindow';
import ResultSheet from './components/results/ResultSheet';
import { AuthProvider } from './security/AuthContext';
import './App.css';

function App() {
  React.useEffect(() => {
    const hardcodedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhOTUwY2E5YTAyN2UwNjRlNTZhZDdkNSIsInVzZXJUeXBlIjoic3R1ZGVudCIsImlhdCI6MTc4ODQzMDg4NiwiZXhwIjoxNzkxMDIyODg2fQ.9b1_oaH5d5gKuv1n4S6jSbNLEr-TZRK4zxfmTKQnIDQ';
    localStorage.setItem('token', hardcodedToken);
    localStorage.setItem('studentToken', hardcodedToken);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <main className="content-area">
            <Routes>
              <Route path="/" element={<TestList />} />
              <Route path="/exam/:testId" element={<ExamWindow />} />
              <Route path="/results" element={<ResultSheet />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
