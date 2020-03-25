import Vue from 'vue';
import VueRouter from 'vue-router';

/**
 * Main window views
 */

const MainWindow = () => import(/* webpackChunkName: "main" */ '@views/MainWindow');

const Start = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Start');
const Workspace = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace');
const TestWorkspace = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/Workspace');

const Settings = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings');
const SigninLinkCheck = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/SigninLinkCheck');

const Auth = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth');
const AuthHello = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth/Hello');
const AuthCredentials = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth/Credentials');

const PushWindow = () => import(/* webpackChunkName: "push" */ '@views/PushWindow');
const PushWindowPoke = () => import(/* webpackChunkName: "push" */ '@views/PushWindow/Poke');

Vue.use(VueRouter);

const routes = [
  {
    /**
     * Main window routes
     * Has several layout:
     *  – Auth
     *  – Workspace
     *  – Settings
     */
    path: '/main-window',
    component: MainWindow,
    children: [

      /**
       * Route for initial window loading
       */
      {
        path: '',
        component: Start,
      },

      /**
       * Auth layout
       */
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

      /**
       * Workspace layout
       */
      {
        path: 'workspace',
        name: 'workspace',
        component: Workspace,
        children: [
          {
            path: '',
            component: TestWorkspace,
          },
        ],
      },

      /**
       * Settings layout
       */
      {
        path: 'settings',
        name: 'settings',
        component: Settings,
      },

      /**
       * Process signin link from deep link
       * TODO: may be need to move out?
       */
      {
        path: 'signinbylink',
        component: SigninLinkCheck,
      },

    ],
  },

  /**
   * Push window routes
   */
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

  /**
   * Redirect other routes to main window
   */
  {
    path: '*',
    redirect: '/main-window',
  },
];

const router = new VueRouter({
  routes,
});

export default router;
