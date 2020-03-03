import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/start',
    name: 'Start',
    component: () => import(/* webpackChunkName: "start" */ '@views/Start.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '@views/Login.vue'),
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import(/* webpackChunkName: "main" */ '@views/Main.vue'),
  },
  {
    path: '*',
    redirect: '/start',
  },
];

const router = new VueRouter({
  routes,
});

export default router;
