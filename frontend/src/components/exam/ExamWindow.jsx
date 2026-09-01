import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startAttempt, fetchQuestions, saveAnswer, submitExam } from '../../api/examService';
import Timer from './Timer';
import Palette from './Palette';
import QuestionPane from './QuestionPane';
import { useExamSecurity } from '../../security/useExamSecurity';
import { LockoutScreen } from '../../security/LockoutScreen';

function ExamWindow() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [attemptData, setAttemptData] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: { selectedAnswer: any, status: 'answered' | 'marked_for_review' | etc } }
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const { violationsCount, isLocked, startSecurityMonitoring, stopSecurityMonitoring } = useExamSecurity(attemptData?.attempt?._id);

  useEffect(() => {
    const initExam = async () => {
      try {
        setLoading(true);
        // Start the attempt
        const attempt = await startAttempt(testId);
        setAttemptData(attempt);

        // Fetch questions
        const qData = await fetchQuestions(testId);
        setQuestions(qData.questions || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    initExam();
  }, [testId]);

  useEffect(() => {
    if (attemptData?.attempt?._id) {
      startSecurityMonitoring();
    }
  }, [attemptData, startSecurityMonitoring]);

  useEffect(() => {
    return () => {
      stopSecurityMonitoring();
    };
  }, [stopSecurityMonitoring]);

  const handleAnswerChange = (value) => {
    const currentQ = questions[currentIndex];
    
    // Auto-save logic
    const newStatus = answers[currentQ.id]?.status === 'marked_for_review' || answers[currentQ.id]?.status === 'answered_and_marked'
      ? 'answered_and_marked' 
      : 'answered';

    const newAnswer = {
      selectedAnswer: value,
      status: newStatus
    };

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: newAnswer
    }));

        // Save to backend asynchronously
    saveAnswer(attemptData.attempt._id, currentQ.id, value, newStatus).catch(err => {
      console.error("Failed to auto-save answer:", err);
    });
  };

  const handleMarkForReview = () => {
    const currentQ = questions[currentIndex];
    const currentAns = answers[currentQ.id];
    
    let newStatus = 'marked_for_review';
    if (currentAns?.selectedAnswer) {
      newStatus = 'answered_and_marked';
    }

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        status: newStatus
      }
    }));

    // Save to backend
    saveAnswer(attemptData.attempt._id, currentQ.id, currentAns?.selectedAnswer, newStatus).catch(err => {
      console.error("Failed to auto-save answer:", err);
    });
  };

  const handleClearResponse = () => {
    const currentQ = questions[currentIndex];
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });

    // Reset on backend
    saveAnswer(attemptData.attempt._id, currentQ.id, null, 'not_visited').catch(err => {
      console.error("Failed to auto-save clear:", err);
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!attemptData?.attempt?._id) return;
    try {
      setLoading(true);
      setShowConfirmSubmit(false);
      stopSecurityMonitoring();
      const res = await submitExam(attemptData.attempt._id);
      navigate('/results', { state: { evaluation: res.evaluation } });
    } catch (err) {
      alert("Failed to submit exam: " + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="view-loader-container">
        <div className="spinner"></div>
        <p>Loading Exam Environment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-container">
        <div className="error-message">Error starting exam: {error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Return to Tests</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="panel-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {isLocked && <LockoutScreen violationsCount={violationsCount} />}
      
      {showConfirmSubmit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px',
            maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>Submit Exam?</h3>
            <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
              Are you sure you want to submit your exam? You won't be able to change your answers after submission.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setShowConfirmSubmit(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Yes, Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>CBT Mock Test</h2>
        <div>
          <Timer endTime={attemptData?.attempt?.endTime} onExpire={handleSubmit} />
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '24px', gap: '24px' }}>
        
        {/* Left: Question Pane */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <QuestionPane 
            question={currentQ} 
            currentAnswer={answers[currentQ?.id]?.selectedAnswer}
            onChange={handleAnswerChange}
          />
          
          {/* Action Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline" onClick={handleMarkForReview}>
                Mark for Review
              </button>
              <button className="btn btn-outline-danger" onClick={handleClearResponse}>
                Clear Response
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={handlePrev} disabled={currentIndex === 0}>
                Previous
              </button>
              <button className="btn btn-primary" onClick={handleNext} disabled={currentIndex === questions.length - 1}>
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* Right: Palette */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Palette 
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            onSelect={(idx) => setCurrentIndex(idx)}
          />
          <button className="btn btn-primary btn-block" style={{ backgroundColor: 'var(--color-success)', color: '#000' }} onClick={() => setShowConfirmSubmit(true)}>
            Submit Final Exam
          </button>
        </div>

      </div>
    </div>
  );
}

export default ExamWindow;
