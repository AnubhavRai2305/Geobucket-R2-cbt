import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export const useExamSecurity = (attemptId) => {
    const { token } = useAuth();
    const [violationsCount, setViolationsCount] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [examActive, setExamActive] = useState(false);

    const reportViolation = useCallback(async (type, details) => {
        if (!attemptId || !token || isLocked) return;

        try {
            const response = await fetch(`/api/attempts/${attemptId}/violations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type, details })
            });

            const data = await response.json();
            if (data.success) {
                setViolationsCount(data.violationsCount);
                if (data.isLocked) {
                    setIsLocked(true);
                    setExamActive(false);
                }
            }
        } catch (error) {
            console.error("Failed to report security violation:", error);
        }
    }, [attemptId, token, isLocked]);

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

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [examActive, isLocked, reportViolation]);

    const startSecurityMonitoring = () => {
        setExamActive(true);
    };

    const stopSecurityMonitoring = () => {
        setExamActive(false);
    };

    return {
        violationsCount,
        isLocked,
        startSecurityMonitoring,
        stopSecurityMonitoring
    };
};
