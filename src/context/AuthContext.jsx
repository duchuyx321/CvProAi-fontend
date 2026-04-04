import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
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
    const [isInitialized, setIsInitialized] = useState(false);

    const clearAuthState = useCallback(() => {
        localStorage.removeItem('accessToken');
        setUser(null);
    }, []);

    const initializeAuth = useCallback(async () => {
        try {
            // const meRes = await getMe();
            // const me = meRes?.data ?? meRes ?? null;

            // if (!me) {
            //     clearAuthState();
            //     return null;
            // }

            // setUser(me);
            // return me;
            setIsInitialized(!!localStorage.getItem('accessToken'));
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            clearAuthState();
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
            isAuthenticated: !!localStorage.getItem('accessToken'), //!!user,
            isInitialized,
            initializeAuth,
        }),
        [user, isInitialized, initializeAuth, clearAuthState],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
