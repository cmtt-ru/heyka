const Auth = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth');
const AuthLayout = () => import(/* webpackChunkName: "main" */ '@components/Auth/Layout');
const AuthMain = () => import(/* webpackChunkName: "main" */ '@components/Auth/Main');
const AuthEmailSignin = () => import(/* webpackChunkName: "main" */ '@components/Auth/EmailSignin');
const AuthEmailReset = () => import(/* webpackChunkName: "main" */ '@components/Auth/EmailReset');
const AuthEmailSignup = () => import(/* webpackChunkName: "main" */ '@components/Auth/EmailSignup');

export const authRoutes = {
  path: '/auth',
  component: Auth,
  children: [
    {
      path: '',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'auth',
          component: AuthMain,
          meta: {
            depth: 1,
          },
        },

        {
          path: 'email-signin',
          name: 'auth-email-signin',
          component: AuthEmailSignin,
          meta: {
            depth: 2,
          },
        },
        {
          path: 'email-reset',
          name: 'auth-email-reset',
          component: AuthEmailReset,
          meta: {
            depth: 3,
          },
        },

        {
          path: 'email-signup',
          name: 'auth-email-signup',
          component: AuthEmailSignup,
          meta: {
            depth: 3,
          },
        },
      ],
    },

  ],
};
