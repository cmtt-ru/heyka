const Auth = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth');
const Login = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth/Login');
const AuthTemp = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth/Temp');
const AuthCodeLogin = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth/AuthCodeLogin');

export const authRoutes = {
  path: 'auth',
  component: Auth,
  children: [
    {
      path: '',
      name: 'auth',
      component: Login,
    },
    {
      path: 'temp',
      name: 'temp',
      component: AuthTemp,
    },
    {
      path: 'code-login',
      name: 'auth-code-login',
      component: AuthCodeLogin,
    },
  ],
};
