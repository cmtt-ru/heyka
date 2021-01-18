const Auth = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth');
const Login = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth/Login');

export const authRoutes = {
  path: 'auth',
  component: Auth,
  children: [
    {
      path: '',
      name: 'auth',
      component: Login,
    },
  ],
};

const NewAuth = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/NewAuth');
const NewAuthLayout = () => import(/* webpackChunkName: "main" */ '@components/NewAuth/Layout');
const NewAuthMain = () => import(/* webpackChunkName: "main" */ '@components/NewAuth/Main');
const NewAuthEmailSignin = () => import(/* webpackChunkName: "main" */ '@components/NewAuth/EmailSignin');
const NewAuthEmailReset = () => import(/* webpackChunkName: "main" */ '@components/NewAuth/EmailReset');
const NewAuthEmailSignup = () => import(/* webpackChunkName: "main" */ '@components/NewAuth/EmailSignup');

export const newAuthRoutes = {
  path: '/new-auth',
  component: NewAuth,
  children: [
    {
      path: '',
      component: NewAuthLayout,
      children: [
        {
          path: '',
          name: 'new-auth',
          component: NewAuthMain,
          meta: {
            depth: 1,
          },
        },

        {
          path: 'email-signin',
          name: 'new-auth-email-signin',
          component: NewAuthEmailSignin,
          meta: {
            depth: 2,
          },
        },
        {
          path: 'email-reset',
          name: 'new-auth-email-reset',
          component: NewAuthEmailReset,
          meta: {
            depth: 3,
          },
        },

        {
          path: 'email-signup',
          name: 'new-auth-email-signup',
          component: NewAuthEmailSignup,
          meta: {
            depth: 3,
          },
        },
      ],
    },

  ],
};
