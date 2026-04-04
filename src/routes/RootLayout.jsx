import { Outlet } from 'react-router-dom';
import AuthExpiredListener from './AuthExpiredListener';

export default function RootLayout() {
    return (
        <>
            <AuthExpiredListener />
            <Outlet />
        </>
    );
}
