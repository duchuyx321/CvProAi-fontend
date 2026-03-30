import { config } from '~/config';
import PublicLayout from '~/layouts/PublicLayout';
import Home from '~/pages/Home';

//  public router
const PublicRouter = [
    {
        path: config.router.home,
        component: Home,
        layout: PublicLayout,
    },
];

// user router
const UserRouter = [];

// admin router
const AdminRouter = [];

export { PublicRouter, UserRouter, AdminRouter };
