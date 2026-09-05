import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTests, fetchMyAttempts } from '../../api/examService';

function TestList() {
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [testData, attemptData] = await Promise.all([
          fetchTests(),
          fetchMyAttempts()
        ]);
        setTests(testData.tests || []);
        setAttempts(attemptData.attempts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStart = (testId) => {
    navigate(`/test-details/${testId}`);
  };

  const handleViewResults = (attempt) => {
    navigate('/results', { 
      state: { 
        evaluation: attempt.evaluation, 
        resultsPublished: true 
      } 
    });
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
    <div className="panel-container" style={{ marginTop: '-16px', height: 'auto' }}>
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
                    View Details
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

      <div className="title-row" style={{ marginTop: '40px' }}>
        <div>
          <h2>My Past Exams</h2>
          <p className="subtitle">Review your previous test submissions.</p>
        </div>
      </div>

      <div className="attempts-table-container">
        <table className="attempts-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map(attempt => (
              <tr key={attempt._id || attempt.id}>
                <td>{attempt.testId?.title}</td>
                <td>{new Date(attempt.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${attempt.status === 'locked' ? 'danger' : 'success'}`}>
                    {attempt.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  {attempt.testId?.resultsPublished && attempt.evaluation
                    ? `${attempt.evaluation.finalScore}`
                    : 'Pending'}
                </td>
                <td className="actions-cell">
                  {attempt.status === 'submitted' && attempt.testId?.resultsPublished ? (
                    <button 
                      className="btn btn-outline btn-sm" 
                      onClick={() => handleViewResults(attempt)}
                    >
                      View Results
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Results Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {attempts.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  You have not taken any exams yet.
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
