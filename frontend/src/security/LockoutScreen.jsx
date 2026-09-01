import React from 'react';
import './LockoutScreen.css';

export const LockoutScreen = ({ violationsCount = 0 }) => {
    return (
        <div className="lockout-overlay">
            <div className="lockout-container">
                <div className="lockout-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
                <h1 className="lockout-title">Exam Locked</h1>
                <p className="lockout-message">
                    Your examination has been temporarily suspended due to the detection of restricted activities.
                </p>
                <div className="lockout-stats">
                    <span className="stat-label">Detected Violations:</span>
                    <span className="stat-value">{violationsCount}</span>
                </div>
                <div className="lockout-instructions">
                    <p>Please contact your invigilator immediately to review your session and request an unlock.</p>
                </div>
            </div>
        </div>
    );
};
