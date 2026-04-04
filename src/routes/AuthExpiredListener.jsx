import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '~/context/AuthContext';

export default function AuthExpiredListener() {
    const navigate = useNavigate();
    const { clearAuthState } = useAuth();

    useEffect(() => {
        const handleAuthExpired = (event) => {
            const message =
                event?.detail?.message ||
                'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';

            localStorage.removeItem('accessToken');
            clearAuthState();
            toast.error(message);
            navigate('/', { replace: true });
        };

        window.addEventListener('auth:expired', handleAuthExpired);

        return () => {
            window.removeEventListener('auth:expired', handleAuthExpired);
        };
    }, [clearAuthState, navigate]);

    return null;
}
