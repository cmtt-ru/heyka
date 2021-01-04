import Vue from 'vue';
import VueRouter from 'vue-router';
import { workspaceRoutes } from './workspaceRoutes';
import { authRoutes } from './authRoutes';
import { callRoutes } from './callRoutes';
import { settingsRoutes } from './settingsRoutes';
import { styleguideRoutes } from './styleguideRoutes';

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

      /* Board holder window */
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

export default router;
