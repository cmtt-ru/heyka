import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/main-window',
    component: () => import(/* webpackChunkName: "main" */ '@views/MainWindow'),
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Start.vue'),
      },
      {
        path: 'workspace',
        component: () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace.vue'),
      },
      {
        path: 'auth',
        component: () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth'),
        children: [
          {
            path: '',
            component: () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth/Hello.vue'),
          },
          {
            path: 'credentials',
            component: () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Auth/Credentials.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/push-window',
    component: () => import(/* webpackChunkName: "push" */ '@views/PushWindow'),
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "push" */ '@views/PushWindow/Poke.vue'),
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
