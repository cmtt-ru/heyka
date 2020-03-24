import Vue from 'vue';
import VueRouter from 'vue-router';
const MainWindow = () => import(/* webpackChunkName: "main" */ '@views/MainWindow');
const Start = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Start');
const SigninLinkCheck = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/SigninLinkCheck');
const Workspace = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace');
const Auth = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth');
const AuthHello = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth/Hello');
const AuthCredentials = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth/Credentials');
const PushWindow = () => import(/* webpackChunkName: "push" */ '@views/PushWindow');
const PushWindowPoke = () => import(/* webpackChunkName: "push" */ '@views/PushWindow/Poke');

Vue.use(VueRouter);

const routes = [
  {
    path: '/main-window',
    component: MainWindow,
    children: [
      {
        path: '',
        component: Start,
      },
      {
        path: 'signinbylink',
        component: SigninLinkCheck,
      },
      {
        path: 'workspace',
        component: Workspace,
      },
      {
        path: 'auth',
        component: Auth,
        children: [
          {
            path: '',
            component: AuthHello,
          },
          {
            path: 'credentials',
            component: AuthCredentials,
          },
        ],
      },
    ],
  },
  {
    path: '/push-window',
    component: PushWindow,
    children: [
      {
        path: '',
        component: PushWindowPoke,
      },
    ],
  },
  {
    path: '*',
    redirect: '/main-window',
  },
];

const router = new VueRouter({
  routes,
});

export default router;
