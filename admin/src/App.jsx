import { useState, useEffect, Suspense, lazy } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import './App.css';

// Lazy load panels for optimized frontend bundle chunks
const Proctor = lazy(() => import('./components/Proctor'));
const TestBuilder = lazy(() => import('./components/TestBuilder'));
const QuestionEditor = lazy(() => import('./components/QuestionEditor'));
const Reports = lazy(() => import('./components/Reports'));
const StudentManager = lazy(() => import('./components/StudentManager'));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [currentView, setCurrentView] = useState('proctor'); // Default view
  const [editingTest, setEditingTest] = useState(null); // Active test in QuestionEditor

  // Check auth status on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedName = localStorage.getItem('name');

    if (token && storedRole && storedName) {
      setIsAuthenticated(true);
      setRole(storedRole);
      setName(storedName);
      if (storedRole === 'counsellor') {
        setCurrentView('proctor');
      } else {
        setCurrentView('test-builder');
      }
    }
  }, []);

  const handleLoginSuccess = (staff) => {
    setIsAuthenticated(true);
    setRole(staff.role);
    setName(staff.name);
    if (staff.role === 'counsellor') {
      setCurrentView('proctor');
    } else {
      setCurrentView('test-builder');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setIsAuthenticated(false);
    setRole('');
    setName('');
    setEditingTest(null);
    setCurrentView('proctor');
  };

  const handleEditQuestions = (test) => {
    setEditingTest(test);
    setCurrentView('question-editor');
  };

  const handleBackToTests = () => {
    setEditingTest(null);
    setCurrentView('test-builder');
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        role={role}
        name={name}
        onLogout={handleLogout}
      />
      
      <main className="content-area">
        <Suspense fallback={
          <div className="view-loader-container">
            <div className="spinner"></div>
            <p>Loading panel workspace...</p>
          </div>
        }>
          {currentView === 'test-builder' && role !== 'counsellor' && (
            <TestBuilder onEditQuestions={handleEditQuestions} />
          )}
          
          {currentView === 'question-editor' && role !== 'counsellor' && editingTest && (
            <QuestionEditor test={editingTest} onBack={handleBackToTests} />
          )}

          {currentView === 'proctor' && (
            <Proctor />
          )}

          {currentView === 'reports' && (
            <Reports />
          )}

          {currentView === 'student-manager' && role !== 'counsellor' && (
            <StudentManager />
          )}
        </Suspense>
      </main>
    </div>
  );
}

export default App;
