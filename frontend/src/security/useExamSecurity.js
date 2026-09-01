import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

export const useExamSecurity = (attemptId) => {
    const { token } = useAuth();
    const [violationsCount, setViolationsCount] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [examActive, setExamActive] = useState(false);
    
    // For Violation API Failure Handling
    const failedViolationsQueue = useRef([]);

    // Interruption/Resume Behavior: Fetch attempt state on mount
    useEffect(() => {
        const fetchAttemptStatus = async () => {
            if (!attemptId || !token) return;
            try {
                const response = await fetch(`/api/attempts/${attemptId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.attempt) {
                        setViolationsCount(data.attempt.violationsCount || 0);
                        if (data.attempt.status === 'locked') {
                            setIsLocked(true);
                            setExamActive(false);
                        }
                    }
                }
            } catch (error) {
                console.warn("Could not resume attempt state, proceeding with default.", error);
            }
        };
        
        fetchAttemptStatus();
    }, [attemptId, token]);

    const reportViolation = useCallback(async (type, details) => {
        if (!attemptId || !token || isLocked) return;

        const payload = { type, details, timestamp: new Date().toISOString() };

        const sendRequest = async (violationData) => {
            try {
                const response = await fetch(`/api/attempts/${attemptId}/violations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(violationData)
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setViolationsCount(data.violationsCount);
                        if (data.isLocked) {
                            setIsLocked(true);
                            setExamActive(false);
                        }
                        return true;
                    }
                }
                return false;
            } catch (error) {
                console.error("Network error reporting violation:", error);
                return false;
            }
        };

        const success = await sendRequest(payload);
        
        // Violation API Failure Handling: Queue failed requests
        if (!success) {
            failedViolationsQueue.current.push(payload);
        } else if (failedViolationsQueue.current.length > 0) {
            // If successful and we have a queue, try to flush the queue
            const queue = [...failedViolationsQueue.current];
            failedViolationsQueue.current = [];
            for (const queuedItem of queue) {
                const queuedSuccess = await sendRequest(queuedItem);
                if (!queuedSuccess) {
                    failedViolationsQueue.current.push(queuedItem);
                }
            }
        }
    }, [attemptId, token, isLocked]);

    const enterFullscreen = useCallback(() => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        }
    }, []);

    // Global keyboard block when locked
    useEffect(() => {
        if (!isLocked) return;
        
        const blockAllKeys = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        
        // Use capturing phase to intercept before React or other listeners
        document.addEventListener('keydown', blockAllKeys, true);
        return () => document.removeEventListener('keydown', blockAllKeys, true);
    }, [isLocked]);

    // Anti-cheating event listeners
    useEffect(() => {
        if (!examActive || isLocked) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                reportViolation('tab_switch', 'User switched tabs or minimized the browser window.');
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                reportViolation('fullscreen_exit', 'User exited full-screen mode.');
            }
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
            reportViolation('restricted_shortcut', 'User attempted to open context menu.');
        };

        const handleCopyPaste = (e) => {
            e.preventDefault();
            reportViolation('clipboard_action', `User attempted to ${e.type}.`);
        };

        const handleKeyDown = (e) => {
            // Block common shortcuts like Ctrl+C, Ctrl+V, Alt+Tab, F12, PrintScreen
            if (
                e.key === 'F12' ||
                e.key === 'PrintScreen' ||
                (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'p')) ||
                e.altKey ||
                e.metaKey
            ) {
                e.preventDefault();
                reportViolation('restricted_shortcut', `User pressed restricted key combination: ${e.key}`);
            }
        };

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = ''; // Standard way to show prompt on refresh/close
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('cut', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('cut', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [examActive, isLocked, reportViolation]);

    const startSecurityMonitoring = () => {
        setExamActive(true);
        enterFullscreen();
    };

    const stopSecurityMonitoring = () => {
        setExamActive(false);
    };

    return {
        violationsCount,
        isLocked,
        startSecurityMonitoring,
        stopSecurityMonitoring,
        enterFullscreen
    };
};
