import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '../api/apiConfig';

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
                const response = await fetch(`${API_BASE_URL}/attempts/${attemptId}`, {
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

        console.log(`[Security Alert] Detected violation: ${type}. Sending to backend...`);

        const payload = { type, details, timestamp: new Date().toISOString() };

        const sendRequest = async (violationData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/attempts/${attemptId}/violations`, {
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
                        console.log(`[Security Alert] Backend acknowledged violation. Total count: ${data.violationsCount}`);
                        setViolationsCount(data.violationsCount);
                        if (data.isLocked) {
                            console.warn(`[Security Alert] Exam is now LOCKED by the backend!`);
                            setIsLocked(true);
                            setExamActive(false);
                        }
                        return true;
                    }
                }
                console.error("[Security Alert] Backend rejected the violation report.", await response.text());
                return false;
            } catch (error) {
                console.error("[Security Alert] Network error reporting violation:", error);
                return false;
            }
        };

        const success = await sendRequest(payload);
        
        // Violation API Failure Handling: Queue failed requests
        if (!success) {
            console.warn("[Security Alert] Queuing violation due to network failure.");
            failedViolationsQueue.current.push(payload);
        } else if (failedViolationsQueue.current.length > 0) {
            // If successful and we have a queue, try to flush the queue
            console.log("[Security Alert] Flushing offline violation queue...");
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
                console.warn(`[Security] Fullscreen requires user interaction: ${err.message}`);
            });
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen().catch(err => console.warn(err.message));
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen().catch(err => console.warn(err.message));
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

        // 1. Tab & Window Switching Detection
        const handleVisibilityChange = () => {
            if (document.hidden) {
                reportViolation('tab_switch', 'User switched tabs or minimized the browser window.');
            }
        };

        const handleBlur = () => {
            // Failsafe for ALT+TAB / Window losing focus even if not fully hidden
            reportViolation('tab_switch', 'Window lost focus (ALT+TAB or clicked outside).');
        };

        // 2. Fullscreen Exit Detection
        const handleFullscreenChange = () => {
            const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            if (!isFullscreen) {
                reportViolation('fullscreen_exit', 'User exited full-screen mode.');
                // Aggressively attempt to force them back into fullscreen if they press escape
                setTimeout(() => {
                    if (examActive && !isLocked) {
                        enterFullscreen();
                    }
                }, 100);
            }
        };

        // 3. Force Fullscreen on First Click (Bypass browser gesture restrictions)
        const enforceInitialFullscreen = () => {
            const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            if (!isFullscreen && examActive && !isLocked) {
                enterFullscreen();
            }
        };

        // 4. Clipboard & Context Menu Restrictions
        const handleContextMenu = (e) => {
            e.preventDefault();
            reportViolation('restricted_shortcut', 'User attempted to open context menu.');
        };

        const handleCopyPaste = (e) => {
            e.preventDefault();
            reportViolation('clipboard_action', `User attempted to ${e.type}.`);
        };

        // 5. Keyboard Restrictions
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

        // 6. Refresh Handling
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = ''; // Standard way to show prompt on refresh/close
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
        
        document.addEventListener('click', enforceInitialFullscreen);
        
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('cut', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
            
            document.removeEventListener('click', enforceInitialFullscreen);
            
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('cut', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [examActive, isLocked, reportViolation, enterFullscreen]);

    const startSecurityMonitoring = useCallback(() => {
        setExamActive(true);
        enterFullscreen();
    }, [enterFullscreen]);

    const stopSecurityMonitoring = useCallback(() => {
        setExamActive(false);
    }, []);

    return {
        violationsCount,
        isLocked,
        startSecurityMonitoring,
        stopSecurityMonitoring,
        enterFullscreen
    };
};
