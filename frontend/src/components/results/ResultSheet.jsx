import { useLocation, useNavigate } from 'react-router-dom';

function ResultSheet() {
  const location = useLocation();
  const navigate = useNavigate();
  const evaluation = location.state?.evaluation;
  const resultsPublished = location.state?.resultsPublished;

  if (resultsPublished === false) {
    return (
      <div className="panel-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="login-form" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h2>Exam Submitted Successfully!</h2>
          <p className="subtitle" style={{ marginBottom: '32px' }}>Results will be published later by your instructor.</p>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="panel-container">
        <div className="error-message">No evaluation data found.</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Tests</button>
      </div>
    );
  }

  return (
    <div className="panel-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="login-form" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h2>Exam Submitted Successfully!</h2>
        <p className="subtitle" style={{ marginBottom: '32px' }}>Here is your final evaluation.</p>
        
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="metric-card">
            <h3>{evaluation.finalScore}</h3>
            <p>Final Score</p>
          </div>
          <div className="metric-card">
            <h3 style={{ color: 'var(--color-success)' }}>{evaluation.correctCount}</h3>
            <p>Correct Answers</p>
          </div>
          <div className="metric-card">
            <h3 style={{ color: 'var(--color-danger)' }}>{evaluation.incorrectCount}</h3>
            <p>Incorrect Answers</p>
          </div>
          <div className="metric-card">
            <h3 style={{ color: 'var(--text-secondary)' }}>{evaluation.skippedCount}</h3>
            <p>Skipped</p>
          </div>
        </div>

        <button className="btn btn-primary btn-block" onClick={() => navigate('/')}>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export default ResultSheet;
