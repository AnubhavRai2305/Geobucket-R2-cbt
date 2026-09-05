import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTestDetails } from '../../api/examService';

function TestDetails() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await fetchTestDetails(testId);
        setTest(data.test);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [testId]);

  const handleStart = () => {
    navigate(`/exam/${testId}`);
  };

  if (loading) {
    return (
      <div className="view-loader-container">
        <div className="spinner"></div>
        <p>Loading test details...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="panel-container">
        <div className="error-message">Error: {error || 'Test not found'}</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Tests</button>
      </div>
    );
  }

  return (
    <div className="panel-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '32px', height: 'auto' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>{test.title}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="metric-card" style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Subject</p>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{test.subject}</h3>
        </div>
        <div className="metric-card" style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Topic</p>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{test.topic}</h3>
        </div>
        <div className="metric-card" style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Duration</p>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{test.durationMinutes} Minutes</h3>
        </div>
        <div className="metric-card" style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Language</p>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{test.language || 'English'}</h3>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--color-primary)' }}>Important Instructions</h3>
        <ul style={{ listStyleType: 'disc', paddingLeft: '24px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.</li>
          <li>When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
          <li>Do not switch tabs or exit fullscreen mode during the exam. Doing so may result in an automatic submission.</li>
          <li>Each question has {test.markingScheme?.correct || 1} mark(s) for a correct answer and {test.markingScheme?.incorrect || 0} mark(s) for an incorrect answer.</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={() => navigate('/')}>Back</button>
        <button className="btn btn-primary" onClick={handleStart}>I have read the instructions, Start Exam</button>
      </div>
    </div>
  );
}

export default TestDetails;
