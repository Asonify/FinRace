import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '../utils/axiosinstance';
import { API_PATHS } from '../utils/apiPaths';
import { persistence } from '../utils/persistence';

/**
 * UserContext:
 * Centralized state management for user authentication and profile data.
 * Handles persistent sessions, auto-login, and secure logout flows.
 */
const UserContext = createContext();
export { UserContext };

const UserProvider = ({ children }) => {
    // Sync state with local storage on initialization to prevent flashes of unauthenticated state
    const [user, setUser] = useState(() => persistence.getUser());

    /**
     * Auth Checking Logic:
     * determines if the app is currently verifying a token against the backend.
     * Starts as 'true' if we have a token but no user object yet.
     */
    const [isAuthChecking, setIsAuthChecking] = useState(() => {
        const hasToken = !!persistence.getToken();
        const hasUser = !!persistence.getUser();
        return hasToken && !hasUser;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!(persistence.getToken() && persistence.getUser());
    });

    // Unified helper to wipe all local auth data
    const clearSession = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        persistence.clearToken();
        persistence.clearUser();
    }, []);

    /**
     * Session Restoration Hook:
     * Runs on mount to verify the stored JWT. 
     * If the network is down, we prioritize the local cached profile to support offline PWA use.
     */
    useEffect(() => {
        const verifyAndRestoreSession = async () => {
            try {
                // Hint the browser to keep our storage even when disk space is low (Crucial for PWAs)
                if (navigator.storage && navigator.storage.persist) {
                    navigator.storage.persist().catch(() => { });
                }

                const token = persistence.getToken();
                if (!token) {
                    setIsAuthChecking(false);
                    setIsAuthenticated(false);
                    return;
                }

                try {
                    const response = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);

                    let userData = null;
                    if (response.data) {
                        userData = response.data.user || (response.data._id ? response.data : null);
                    }

                    if (userData) {
                        setUser(userData);
                        setIsAuthenticated(true);
                        persistence.setUser(userData);
                    }
                } catch (error) {
                    /** 
                     * Error Handling Policy:
                     * 401/403 -> Token is dead, force logout.
                     * Any other error -> Server/Network issue, trust local cache for UX continuity.
                     */
                    if (error.response && [401, 403].includes(error.response.status)) {
                        console.warn('Authentication expired or invalid, clearing session');
                        clearSession();
                    } else {
                        console.log('Network error or server down, keeping existing session');
                        if (persistence.getToken() && persistence.getUser()) {
                            setIsAuthenticated(true);
                        }
                    }
                }
            } catch (error) {
                console.error('Session restoration error:', error);
            } finally {
                setIsAuthChecking(false);
            }
        };

        verifyAndRestoreSession();
    }, [clearSession]);

    // Updates both React state and persistent storage for profile-level changes
    const updateUser = useCallback((userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        if (userData) {
            persistence.setUser(userData);
        } else {
            persistence.clearUser();
        }
    }, []);

    // Entry point for new login sessions
    const login = useCallback((userData, token) => {
        persistence.setToken(token);
        persistence.setUser(userData);
        setUser(userData);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        clearSession();
    }, [clearSession]);

    // Use memoization to prevent unnecessary context re-renders across the app tree
    const contextValue = useMemo(() => ({
        user,
        updateUser,
        clearUser: logout,
        login,
        logout,
        isAuthChecking,
        isAuthenticated
    }), [user, updateUser, logout, login, isAuthChecking, isAuthenticated]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;