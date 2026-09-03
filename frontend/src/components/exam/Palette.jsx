import React from 'react';

function Palette({ questions, answers, currentIndex, onSelect }) {
  const getStatusClass = (questionId) => {
    const ans = answers[questionId];
    if (!ans) return 'palette-not-visited';
    switch (ans.status) {
      case 'answered': return 'palette-answered';
      case 'marked_for_review': return 'palette-marked';
      case 'answered_and_marked': return 'palette-answered-marked';
      case 'not_answered': return 'palette-not-answered';
      case 'not_visited':
      default: return 'palette-not-visited';
    }
  };

  return (
    <div className="questions-sidebar" style={{ width: '280px', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '8px' }}>Question Palette</h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {questions.map((q, index) => {
          const statusClass = getStatusClass(q.id);
          const isActive = index === currentIndex;
          
          return (
            <button
              key={q.id}
              onClick={() => onSelect(index)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: isActive ? '2px solid var(--color-primary)' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              className={`palette-btn ${statusClass}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div className="palette-answered" style={{ width: '16px', height: '16px', borderRadius: '4px' }}></div>
          <span>Answered</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div className="palette-not-answered" style={{ width: '16px', height: '16px', borderRadius: '4px' }}></div>
          <span>Not Answered</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div className="palette-not-visited" style={{ width: '16px', height: '16px', borderRadius: '4px' }}></div>
          <span>Not Visited</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div className="palette-marked" style={{ width: '16px', height: '16px', borderRadius: '4px' }}></div>
          <span>Marked for Review</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="palette-answered-marked" style={{ width: '16px', height: '16px', borderRadius: '4px' }}></div>
          <span>Answered & Marked for Review</span>
        </div>
      </div>
    </div>
  );
}

export default Palette;
