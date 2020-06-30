const Auth = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth');
const AuthTemp = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth/Temp');

export const authRoutes = {
  path: 'auth',
  component: Auth,
  children: [
    {
      path: '',
      name: 'auth',
      component: AuthTemp,
    },
  ],
};