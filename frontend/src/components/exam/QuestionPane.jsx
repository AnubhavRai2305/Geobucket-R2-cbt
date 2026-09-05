import React from 'react';

function QuestionPane({ question, currentAnswer, onChange, currentIndex, totalQuestions }) {
  if (!question) return null;

  const handleMCQChange = (optionId) => {
    onChange(optionId);
  };

  const handleMSQChange = (optionId) => {
    const prev = Array.isArray(currentAnswer) ? currentAnswer : [];
    if (prev.includes(optionId)) {
      onChange(prev.filter(id => id !== optionId));
    } else {
      onChange([...prev, optionId]);
    }
  };

  const handleNATChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="editor-main" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="editor-header">
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>
          Question {currentIndex !== undefined && totalQuestions ? `${currentIndex + 1} of ${totalQuestions}` : ''}
        </h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-success)' }}>
            +{question.marks || question.positiveMarks || 1} Marks
          </span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-danger)' }}>
            -{question.negativeMarks || 0} Negative
          </span>
          <span className="q-badge" style={{ fontSize: '12px', padding: '4px 10px' }}>
            {question.type}
          </span>
        </div>
      </div>

      <div 
        style={{ fontSize: '16px', marginBottom: '32px', lineHeight: '1.6' }}
        dangerouslySetInnerHTML={{ __html: question.content }}
      />

      <div style={{ flex: 1 }}>
        {question.type === 'MCQ' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {question.options?.map(opt => (
              <label 
                key={opt.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: 'var(--bg-primary)',
                  border: currentAnswer === opt.id ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input 
                  type="radio" 
                  name={`mcq-${question.id}`}
                  checked={currentAnswer === opt.id}
                  onChange={() => handleMCQChange(opt.id)}
                  style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontSize: '15px' }}>{opt.text}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'MSQ' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {question.options?.map(opt => {
              const isChecked = Array.isArray(currentAnswer) && currentAnswer.includes(opt.id);
              return (
                <label 
                  key={opt.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: 'var(--bg-primary)',
                    border: isChecked ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input 
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleMSQChange(opt.id)}
                    style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                  />
                  <span style={{ fontSize: '15px' }}>{opt.text}</span>
                </label>
              );
            })}
          </div>
        )}

        {question.type === 'NAT' && (
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Enter numeric answer:
            </label>
            <input 
              type="number" 
              step="any"
              value={currentAnswer || ''}
              onChange={handleNATChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '16px'
              }}
              placeholder="e.g. 15.5"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionPane;
