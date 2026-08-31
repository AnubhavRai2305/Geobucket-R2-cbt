import React, { useState, useEffect } from 'react';

function Timer({ endTime, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!endTime) return;

    const targetDate = new Date(endTime).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        onExpire(); // Trigger submission
      } else {
        setTimeLeft(difference);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  // Format time
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const formatUnit = (unit) => (unit < 10 ? `0${unit}` : unit);
  const isUrgent = timeLeft < 5 * 60 * 1000 && timeLeft > 0; // Less than 5 mins

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-accent)',
      border: `1px solid ${isUrgent ? 'var(--color-danger)' : 'var(--border-color)'}`,
      borderRadius: '8px',
      color: isUrgent ? 'var(--color-danger)' : 'var(--text-primary)',
      fontWeight: '700',
      fontSize: '18px',
      fontFamily: 'var(--mono)'
    }}>
      {formatUnit(hours)}:{formatUnit(minutes)}:{formatUnit(seconds)}
    </div>
  );
}

export default Timer;
