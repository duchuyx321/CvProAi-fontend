import { config } from '~/config';
import PublicLayout from '~/layouts/PublicLayout';
import Login from '~/pages/Login';
import Register from '~/pages/Register';
import Home from '~/pages/Home';
import VerifyOTP from '~/pages/VerifyOTP';

//  public router
const PublicRouter = [
    {
        path: config.router.home,
        component: Home,
        layout: PublicLayout,
    },
    {
        path: config.router.login,
        component: Login,
        layout: PublicLayout,
        layoutProps: { hideHeader: true, hideFooter: true },
    },
    {
        path: config.router.register,
        component: Register,
        layout: PublicLayout,
        layoutProps: { hideHeader: true, hideFooter: true },
    },
    {
        path: config.router.otp_verify,
        component: VerifyOTP,
        layout: PublicLayout,
        layoutProps: { hideHeader: true, hideFooter: true },
    },
    {
        path: config.router.reset_pass,
        component: VerifyOTP,
        layout: PublicLayout,
        layoutProps: { hideHeader: true, hideFooter: true },
    },
];

// user router
const UserRouter = [];

// admin router
const AdminRouter = [];

export { PublicRouter, UserRouter, AdminRouter };
