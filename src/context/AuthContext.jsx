import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { refresh, logout as logoutApi } from '~/services/auth.service';
import { getMe } from '~/services/user.service';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    const logoutLocal = useCallback(() => {
        localStorage.removeItem('accessToken');
        setUser(null);
    }, []);

    const initializeAuth = useCallback(async () => {
        setIsLoading(true);

        const token = localStorage.getItem('accessToken');

        if (!token) {
            logoutLocal();
            setIsLoading(false);
            setIsInitialized(true);
            return;
        }

        try {
            const refreshRes = await refresh();
            const newToken =
                refreshRes?.meta?.newAccessToken ||
                refreshRes?.accessToken ||
                refreshRes?.token;

            if (newToken) {
                localStorage.setItem('accessToken', newToken);
            }

            const meRes = await getMe();
            const me = meRes?.data ?? meRes ?? null;

            if (!me) {
                logoutLocal();
            } else {
                setUser(me);
            }
        } catch (error) {
            console.error('Auth init failed:', error?.message);
            logoutLocal();
        } finally {
            setIsLoading(false);
            setIsInitialized(true);
        }
    }, [logoutLocal]);

    const logout = useCallback(async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error('Logout API failed:', error?.message);
        } finally {
            logoutLocal();
        }
    }, [logoutLocal]);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const value = useMemo(() => {
        return {
            user,
            isAuthenticated: !!user,
            isLoading,
            isInitialized,
            initializeAuth,
            logout,
        };
    }, [user, isLoading, isInitialized, initializeAuth, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};