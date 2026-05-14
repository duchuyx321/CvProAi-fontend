import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { logout as logoutApi } from '~/services/auth.service';
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
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const clearAuthState = useCallback(() => {
        localStorage.removeItem('accessToken');
        setUser(null);
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutApi();
        } catch {
            // Always clear local state, even if the API logout fails.
        } finally {
            clearAuthState();
        }
    }, [clearAuthState]);

    const initializeAuth = useCallback(async () => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            setUser(null);
            setIsInitialized(true);
            return null;
        }

        try {
            setIsLoading(true);

            const meRes = await getProfile();
            const me = meRes?.data ?? meRes ?? null;

            if (!meRes?.success) {
                if (meRes?.status === 401) {
                    setUser(null);
                    return null;
                }

                throw new Error(
                    meRes?.message || 'Không thể khởi tạo phiên đăng nhập',
                );
            }

            setUser(me);
            return me;
        } catch (error) {
            console.log(error);
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
            setIsInitialized(true);
        }
    }, []);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const value = useMemo(
        () => ({
            user,
            setUser,
            clearAuthState,
            logout,
            isAuthenticated: !!user,
            isLoading,
            isInitialized,
            initializeAuth,
        }),
        [user, isLoading, isInitialized, initializeAuth, clearAuthState, logout],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
