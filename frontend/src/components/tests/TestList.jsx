import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTests } from '../../api/examService';

function TestList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTests = async () => {
      try {
        const data = await fetchTests();
        setTests(data.tests || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTests();
  }, []);

  const handleStart = (testId) => {
    navigate(`/exam/${testId}`);
  };

  if (loading) {
    return (
      <div className="view-loader-container">
        <div className="spinner"></div>
        <p>Loading assigned tests...</p>
      </div>
    );
  }

  return (
    <div className="panel-container">
      <div className="title-row">
        <div>
          <h2>Available Mock Tests</h2>
          <p className="subtitle">Select a test below to begin your examination.</p>
        </div>
      </div>
      
      {error && <div className="error-message">Error: {error}</div>}
      
      <div className="attempts-table-container">
        <table className="attempts-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Topic</th>
              <th>Duration (Mins)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tests.map(test => (
              <tr key={test.id}>
                <td>{test.title}</td>
                <td>{test.subject}</td>
                <td>{test.topic}</td>
                <td>{test.durationMinutes}</td>
                <td className="actions-cell">
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => handleStart(test.id)}
                  >
                    Start Exam
                  </button>
                </td>
              </tr>
            ))}
            {tests.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No active tests available for you at the moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TestList;
