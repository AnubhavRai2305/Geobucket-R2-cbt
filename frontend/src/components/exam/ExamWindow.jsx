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
  const [draftAnswer, setDraftAnswer] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const attemptId = attemptData?.attemptId || attemptData?.attempt?._id;
  const { violationsCount, isLocked, startSecurityMonitoring, stopSecurityMonitoring } = useExamSecurity(attemptId);

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
    if (questions.length > 0) {
      const currentQ = questions[currentIndex];
      setDraftAnswer(answers[currentQ.id]?.selectedAnswer || null);
    }
  }, [currentIndex, questions, answers]);

  // We removed the on-mount auto-mark so it remains grey while currently viewing.

  useEffect(() => {
    if (attemptId) {
      startSecurityMonitoring();
    }
  }, [attemptId, startSecurityMonitoring]);

  useEffect(() => {
    return () => {
      stopSecurityMonitoring();
    };
  }, [stopSecurityMonitoring]);

  const handleAnswerChange = (value) => {
    setDraftAnswer(value);
  };

  const handleMarkForReview = () => {
    const currentQ = questions[currentIndex];
    
    let newStatus = 'marked_for_review';
    let valToSave = draftAnswer;

    if (valToSave !== null) {
      newStatus = 'answered_and_marked';
    }

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        selectedAnswer: valToSave,
        status: newStatus
      }
    }));

    // Save to backend
    saveAnswer(attemptId, currentQ.id, valToSave, newStatus).catch(err => {
      console.error("Failed to auto-save answer:", err);
    });
  };

  const handleClearResponse = () => {
    const currentQ = questions[currentIndex];
    setDraftAnswer(null);
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

  const markAsNotAnswered = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setAnswers(prev => {
      if (!prev[currentQ.id]) {
        return { ...prev, [currentQ.id]: { selectedAnswer: null, status: 'not_answered' } };
      }
      return prev;
    });
  };

  const handleSaveAndNext = () => {
    const currentQ = questions[currentIndex];
    
    if (draftAnswer !== null) {
      const newStatus = answers[currentQ.id]?.status === 'marked_for_review' || answers[currentQ.id]?.status === 'answered_and_marked'
        ? 'answered_and_marked' 
        : 'answered';

      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: {
          selectedAnswer: draftAnswer,
          status: newStatus
        }
      }));
      
      saveAnswer(attemptData.attempt._id, currentQ.id, draftAnswer, newStatus).catch(err => {
        console.error("Failed to auto-save answer:", err);
      });
    } else {
      markAsNotAnswered();
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    markAsNotAnswered();
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
      const res = await submitExam(attemptId);
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
    <div className="panel-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isLocked && <LockoutScreen violationsCount={violationsCount} />}
      
      {showConfirmSubmit && (() => {
        const total = questions.length;
        const attempted = Object.values(answers).filter(a => a.status === 'answered' || a.status === 'answered_and_marked').length;
        const marked = Object.values(answers).filter(a => a.status === 'marked_for_review' || a.status === 'answered_and_marked').length;
        const skipped = total - attempted;

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              backgroundColor: 'var(--bg-primary)', padding: '32px', borderRadius: '16px',
              maxWidth: '450px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: 'bold' }}>Submit Exam?</h3>
              <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
                Please review your exam summary before final submission. You cannot change your answers after submitting.
              </p>
              
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', 
                marginBottom: '24px', textAlign: 'left', padding: '16px', 
                backgroundColor: 'var(--bg-secondary)', borderRadius: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Attempted</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{attempted}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Skipped</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>{skipped}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Marked for Review</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>{marked}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Security Violations</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: violationsCount > 0 ? '#ef4444' : '#10b981' }}>
                    {violationsCount} / 3
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowConfirmSubmit(false)}>Return to Exam</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>Confirm Submit</button>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* Violation Warning Banner */}
      {!isLocked && violationsCount > 0 && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderLeft: '4px solid #ef4444',
          borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: '500',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span><strong>Warning:</strong> Security violation detected. Please remain in fullscreen and do not switch tabs.</span>
          </div>
          <div style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
          }}>
            {violationsCount}/3 Violations
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '24px', gap: '24px' }}>
        
        {/* Left: Question Pane */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px' }}>
            <QuestionPane 
              question={currentQ} 
              currentAnswer={draftAnswer}
              onChange={handleAnswerChange}
            />
          </div>
          
          {/* Action Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            flexShrink: 0
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
              <button className="btn btn-primary" onClick={handleSaveAndNext} disabled={currentIndex === questions.length - 1}>
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* Right: Palette */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <Palette 
              questions={questions}
              answers={answers}
              currentIndex={currentIndex}
              onSelect={(idx) => {
                markAsNotAnswered();
                setCurrentIndex(idx);
              }}
            />
          </div>
          <button className="submit-exam-btn" style={{ width: '100%', flexShrink: 0 }} onClick={() => setShowConfirmSubmit(true)}>
            Submit Final Exam
          </button>
        </div>

      </div>
    </div>
  );
}

export default ExamWindow;
