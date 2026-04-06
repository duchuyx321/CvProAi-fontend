import { config } from '~/config';
import PublicLayout from '~/layouts/PublicLayout';
import Login from '~/pages/Login';
import Register from '~/pages/Register';
import Home from '~/pages/Home';
import VerifyOTP from '~/pages/VerifyOTP';
import ForgotPassword from '~/pages/ForgotPassword';
import VerifySuccess from '~/pages/VerifySuccess';

import AdminDashboard from '~/pages/Admin/AdminDashboard';
import AdminLayout from '~/layouts/AdminLayout';

import UserDashboard from '~/pages/User/UserDashboard';
import DefaultLayout from '~/layouts/DefaultLayout';
import CvTemplates from '~/pages/User/CvTemplates';
import MyCvs from '~/pages/User/MyCvs';
import UpgradePremium from '~/pages/User/UpgradePremium';
import AiAnalysis from '~/pages/User/AiAnalysis';
import ManageUsers from '~/pages/Admin/ManageUsers/ManageUsers';
import ManageTemplates from '~/pages/Admin/ManageTemplates';

// public router
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
    {
        path: config.router.verify_success,
        component: VerifySuccess,
        layout: PublicLayout,
        layoutProps: { hideHeader: true, hideFooter: true },
    },
    {
        path: config.router.forgot_password,
        component: ForgotPassword,
        layout: PublicLayout,
        layoutProps: { hideHeader: true, hideFooter: true },
    },
];

// user router
const UserRouter = [
    {
        path: config.router.userDashboard,
        component: UserDashboard,
        layout: DefaultLayout,
    },
    {
        path: config.router.cvTemplates,
        component: CvTemplates,
        layout: DefaultLayout,
    },
    {
        path: config.router.myCvs,
        component: MyCvs,
        layout: DefaultLayout,
    },
    {
        path: config.router.aiAnalysis,
        component: AiAnalysis,
        layout: DefaultLayout,
    },
    {
        path: config.router.upgradePremium,
        component: UpgradePremium,
        layout: DefaultLayout,
    },
];

// admin router
const AdminRouter = [
    {
        path: config.router.adminDashboard,
        component: AdminDashboard,
        layout: AdminLayout,
    },
    {
        path: config.router.manageUsers,
        component: ManageUsers,
        layout: AdminLayout,
    },
    {
        path: config.router.manageTemplates,
        component: ManageTemplates,
        layout: AdminLayout,
    },
];

export { PublicRouter, UserRouter, AdminRouter };
