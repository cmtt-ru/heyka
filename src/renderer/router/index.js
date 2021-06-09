import Vue from 'vue';
import VueRouter from 'vue-router';
import { workspaceRoutes } from './workspaceRoutes';
import { authRoutes } from './authRoutes';
import { callRoutes } from './callRoutes';
import { settingsRoutes } from './settingsRoutes';
import { styleguideRoutes } from './styleguideRoutes';
import { editProfileRoutes } from './editProfileRoutes';

const MainWindow = () => import(/* webpackChunkName: "main" */ '@views/MainWindow');
const NoWorkspace = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/NoWorkspace');
const PushWindow = () => import(/* webpackChunkName: "push" */ '@views/Pushes');
const BoardHolderWindow = () => import(/* webpackChunkName: "boardHolder" */ '@views/BoardHolderWindow');

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
      workspaceRoutes,
      authRoutes,
      settingsRoutes,
      styleguideRoutes,
      editProfileRoutes,

      /* No workspace page */
      {
        path: 'no-workspace',
        name: 'no-workspace',
        component: NoWorkspace,
      },
    ],
  },
  ...callRoutes,
  /* Push window route */
  {
    path: '/push-window',
    component: PushWindow,
  },

  /* Board holder window */
  {
    path: '/board-holder',
    component: BoardHolderWindow,
  },

  /**
   * Redirect other routes to main window
   */
  {
    path: '*',
    redirect: '/main-window/workspace',
  },
];

const router = new VueRouter({
  routes,
});

Vue.mixin({
  methods: {
    /**
     * Mixin. Use on ALL "back" buttons in case there is nowhere to go back
     * @param {string} route - default route to safe-redirect to
     *
     * @returns {void}
     */
    __backOrRedirect(route) {
      const originRoute = router.app.$route.fullPath;

      router.back();
      setTimeout(() => {
      // If the route is not changed, we do the redirect
        if (originRoute === router.app.$route.fullPath) {
        // Redirect to the home path by default
          router.replace(route || '/');
        }
      // eslint-disable-next-line no-magic-numbers
      }, 100);
    },
  },
});

export default router;
