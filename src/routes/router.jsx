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

import Dashboard from '~/pages/User/Dashboard';
import DefaultLayout from '~/layouts/DefaultLayout';
import CvTemplates from '~/pages/User/CvTemplates';
import MyCvs from '~/pages/User/MyCvs';
import UpgradePremium from '~/pages/User/UpgradePremium';
import AiAnalysis from '~/pages/User/AiAnalysis';
import ManageUsers from '~/pages/Admin/ManageUsers/ManageUsers';
import ManageTemplates from '~/pages/Admin/ManageTemplates';
import AdminSettings from '~/pages/Admin/AdminSettings';
import ManageOrders from '~/pages/Admin/ManageOrders';
import ManagePackages from '~/pages/Admin/ManagePackages';
import Profile from '~/pages/User/Profile';
import Security from '~/pages/User/Security';
import DetailLayout from '~/layouts/DetailLayout';
import Package from '~/pages/User/Package';
import History from '~/pages/User/History';
import Pricing from '~/pages/Pricing';

// public router
const PublicRouter = [
    {
        path: config.router.home,
        component: Home,
        layout: PublicLayout,
    },
    {
        path: config.router.cvSample,
        component: CvTemplates,
        layout: PublicLayout,
    },
    {
        path: config.router.pricing,
        component: Pricing,
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
    {
        path: config.router.dashboard,
        component: Dashboard,
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
    {
        path: config.router.profile,
        component: Profile,
        layout: DetailLayout,
    },
    {
        path: config.router.security,
        component: Security,
        layout: DetailLayout,
    },
    {
        path: config.router.package,
        component: Package,
        layout: DetailLayout,
    },
    {
        path: config.router.history,
        component: History,
        layout: DetailLayout,
    },
];

// user router
const UserRouter = [];

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
    {
        path: config.router.manageOrders,
        component: ManageOrders,
        layout: AdminLayout,
    },
    {
        path: config.router.managePackages,
        component: ManagePackages,
        layout: AdminLayout,
    },
    {
        path: config.router.adminSettings,
        component: AdminSettings,
        layout: AdminLayout,
    },
];

export { PublicRouter, UserRouter, AdminRouter };