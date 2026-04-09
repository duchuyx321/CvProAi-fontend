import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { getProfile } from '~/services/profile.service';

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
    const [isInitialized, setIsInitialized] = useState(false);

    const clearAuthState = useCallback(() => {
        localStorage.removeItem('accessToken');
        setUser(null);
    }, []);

    const initializeAuth = useCallback(async () => {
        try {
            const meRes = await getProfile();
            const me = meRes?.data ?? meRes ?? null;
            if (!meRes.success) {
                clearAuthState();
                return null;
            }
            console.log(me);

            setUser(me);
            return me;
        } catch (error) {
            console.log(error);
            return null;
        } finally {
            setIsInitialized(true);
        }
    }, [clearAuthState]);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const value = useMemo(
        () => ({
            user,
            setUser,
            clearAuthState,
            isAuthenticated: !!user,
            isInitialized,
            initializeAuth,
        }),
        [user, isInitialized, initializeAuth, clearAuthState],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
