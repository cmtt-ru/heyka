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
