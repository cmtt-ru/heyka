const Settings = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings');
const General = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings/General');
const Devices = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings/Devices');
const Network = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings/Network');
const About = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings/About');
const Support = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings/Support');
const TestZone = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Settings/TestZone');

export const settingsRoutes = {
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
    {
      path: 'test-zone',
      name: 'test-zone',
      component: TestZone,
    },
  ],
};