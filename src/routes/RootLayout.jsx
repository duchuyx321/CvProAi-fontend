import { Outlet } from 'react-router-dom';
import AuthExpiredListener from './AuthExpiredListener';
import { AuthProvider } from '~/context/AuthContext';

export default function RootLayout() {
    return (
        <AuthProvider>
            <AuthExpiredListener />
            <Outlet />
        </AuthProvider>
    );
}
