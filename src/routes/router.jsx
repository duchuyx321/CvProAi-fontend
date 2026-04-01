import { config } from '~/config';
import PublicLayout from '~/layouts/PublicLayout';
import Login from '~/pages/Auth/Login';
import Register from '~/pages/Auth/Register';
import Home from '~/pages/Home';

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
        layoutProps: { hideHeader: true, hideFooter: true }
    },
    {
        path: config.router.register,
        component: Register,
        layout: PublicLayout,
        layoutProps: { hideHeader: true, hideFooter: true }
    },
];

// user router
const UserRouter = [];

// admin router
const AdminRouter = [];

export { PublicRouter, UserRouter, AdminRouter };
