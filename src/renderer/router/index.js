import Vue from 'vue';
import VueRouter from 'vue-router';

/**
 * Main window views
 * @constructor
 */
const MainWindow = () => import(/* webpackChunkName: "main" */ '@views/MainWindow');

/* Auth layout */
const Auth = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth');
const AuthTemp = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth/Temp');

/* Workspace layout */
const Workspace = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace');
const TestWorkspace = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/Workspace');
const Channel = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/Channel');
const User = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/User');

/* Settings layout */
const Settings = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings');
const General = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings/General');
const Devices = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings/Devices');
const Network = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings/Network');
const About = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings/About');
const Support = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings/Support');

/* Signin link from deep link */
const SigninLinkCheck = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/SigninLinkCheck');

/* Styleguide */
const Styleguide = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Styleguide');
const StyleguideButtons = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Styleguide/Buttons');
const StyleguideLists = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Styleguide/Lists');
const StyleguideForms = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Styleguide/Forms');

/**
 * Push window views
 * @constructor
 */
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
       * Auth layout
       */
      {
        path: 'auth',
        component: Auth,
        children: [
          {
            path: '',
            name: 'auth',
            component: AuthTemp,
          },
        ],
      },

      /**
       * Workspace layout
       */
      {
        path: 'workspace',
        component: Workspace,
        children: [
          {
            path: '',
            name: 'workspace',
            component: TestWorkspace,
          },
          {
            path: 'channel/:id',
            name: 'channel',
            component: Channel,
          },
          {
            path: 'user/:id',
            name: 'user',
            component: User,
          },
        ],
      },

      /**
       * Settings layout
       */
      {
        path: 'settings',
        component: Settings,
        children: [
          {
            path: '',
            name: 'settings',
            component: General,
          },
          {
            path: 'devices',
            name: 'settings-devices',
            component: Devices,
          },
          {
            path: 'network',
            name: 'settings-network',
            component: Network,
          },
          {
            path: 'about',
            name: 'settings-about',
            component: About,
          },
          {
            path: 'support',
            name: 'settings-support',
            component: Support,
          },
        ],
      },

      /**
       * Styleguide layout
       */
      {
        path: 'styleguide',
        name: 'styleguide',
        component: Styleguide,
        children: [
          {
            path: 'buttons',
            name: 'styleguide-buttons',
            component: StyleguideButtons,
          },
          {
            path: 'lists',
            name: 'styleguide-lists',
            component: StyleguideLists,
          },
          {
            path: 'forms',
            name: 'styleguide-forms',
            component: StyleguideForms,
          },
        ],
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
