import Vue from 'vue';
import VueRouter from 'vue-router';
import { workspaceRoutes } from './workspaceRoutes';
import { authRoutes } from './authRoutes';
import { callRoutes } from './callRoutes';
import { settingsRoutes } from './settingsRoutes';
import { styleguideRoutes } from './styleguideRoutes';

const MainWindow = () => import(/* webpackChunkName: "main" */ '@views/MainWindow');
const SigninLinkCheck = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/SigninLinkCheck');
const PushWindow = () => import(/* webpackChunkName: "push" */ '@views/Pushes');

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
  ...callRoutes,
  /* Push window route */
  {
    path: '/push-window',
    component: PushWindow,
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

export default router;
