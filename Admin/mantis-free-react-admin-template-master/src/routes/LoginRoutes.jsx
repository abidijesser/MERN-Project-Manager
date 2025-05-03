import { lazy } from 'react';

// project imports
import AuthLayout from 'layout/Auth';
import Loadable from 'components/Loadable';

// jwt auth
// Remplacer la page de connexion par une redirection
const LoginRedirectPage = Loadable(lazy(() => import('pages/auth/LoginRedirect')));
// Page de transfert d'authentification
const AuthTransferPage = Loadable(lazy(() => import('pages/auth/AuthTransfer')));
// Suppression de la page d'inscription
const UnauthorizedPage = Loadable(lazy(() => import('pages/auth/Unauthorized')));
const ForgotPasswordPage = Loadable(lazy(() => import('pages/auth/ForgotPassword')));
const ResetPasswordPage = Loadable(lazy(() => import('pages/auth/ResetPassword')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <AuthLayout />,
      children: [
        {
          path: '/',
          element: <LoginRedirectPage />
        },
        {
          path: '/login',
          element: <LoginRedirectPage />
        },
        // Suppression de la route d'inscription
        {
          path: '/unauthorized',
          element: <UnauthorizedPage />
        },
        {
          path: '/forgot-password',
          element: <ForgotPasswordPage />
        },
        {
          path: '/reset-password/:token',
          element: <ResetPasswordPage />
        },
        {
          path: '/auth-transfer',
          element: <AuthTransferPage />
        }
      ]
    }
  ]
};

export default LoginRoutes;
