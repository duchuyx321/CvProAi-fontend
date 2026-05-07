import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Fragment } from 'react';

import { PublicRouter, UserRouter, AdminRouter } from '~/routes';

import DefaultLayout from '~/layouts/DefaultLayout';
import ProtectedRoute from '~/routes/ProtectedRoute';
import PublicLayout from '~/layouts/PublicLayout';
import AdminLayout from '~/layouts/AdminLayout';
import RootLayout from '~/routes/RootLayout';

function App() {
    const router = createBrowserRouter([
        {
            path: '/',
            element: <RootLayout />,
            children: [
                ...PublicRouter.map((item) => {
                    let Layout =
                        item.layout === null
                            ? Fragment
                            : item.layout || PublicLayout;

                    const Page = item.component;
                    const layoutProps = item.layoutProps || {};

                    return {
                        path: item.path,
                        element: (
                            <Layout {...layoutProps}>
                                <Page />
                            </Layout>
                        ),
                    };
                }),

                ...UserRouter.map((item) => {
                    let Layout =
                        item.layout === null
                            ? Fragment
                            : item.layout || DefaultLayout;

                    const Page = item.component;

                    return {
                        path: item.path,
                        element: (
                            <ProtectedRoute role="User">
                                <Layout>
                                    <Page />
                                </Layout>
                            </ProtectedRoute>
                        ),
                    };
                }),

                ...AdminRouter.map((item) => {
                    let Layout =
                        item.layout === null
                            ? Fragment
                            : item.layout || AdminLayout;

                    const Page = item.component;

                    return {
                        path: item.path,
                        element: (
                            <ProtectedRoute role="Admin">
                                <Layout>
                                    <Page />
                                </Layout>
                            </ProtectedRoute>
                        ),
                    };
                }),
            ],
        },
    ]);

    return (
        <RouterProvider
            router={router}
            future={{
                v7_startTransition: true,
            }}
        />
    );
}

export default App;
