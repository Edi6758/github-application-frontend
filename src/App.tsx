/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBrowserRouter, Outlet, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import Search from './routes/search';
import Repositories from './routes/repositories';
import UserDetails from './routes/user';
import Register from './routes/register';
import Login from './routes/login';
import ErrorPage from './error-page';
import History from './routes/history';

function PrivateRoute({ children }: any) {
  const { isLogged } = useAuth();

  return isLogged ? children : <Navigate to="/login" />;
}

const App = () => {
  const routes = [
    {
      path: '/',
      element: <PrivateRoute><Outlet /></PrivateRoute>,
      children: [
        { path: '/', element: <Search /> },
        { path: 'search', element: <Search /> },
        { path: 'repositories/:username', element: <Repositories /> },
        { path: 'profile/:username', element: <UserDetails /> },
        { path: 'history', element: <History /> },
      ],
      errorElement: <ErrorPage />,
    },
    { path: 'register', element: <Register />, errorElement: <ErrorPage /> },
    { path: 'login', element: <Login />, errorElement: <ErrorPage /> },
  ];

  const router = createBrowserRouter(routes);

  return (
    <RouterProvider router={router} />
  );
};

export default App;
