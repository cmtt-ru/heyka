const Styleguide = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Styleguide');
const StyleguideButtons = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Styleguide/Buttons');
const StyleguideLists = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Styleguide/Lists');
const StyleguideForms = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Styleguide/Forms');
const StyleguideNotifications = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Styleguide/Notifications');
const StyleguideTabs = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Styleguide/Tabs');

export const styleguideRoutes = {
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
    {
      path: 'notifications',
      name: 'styleguide-notifications',
      component: StyleguideNotifications,
    },
    {
      path: 'tabs',
      name: 'styleguide-tabs',
      component: StyleguideTabs,
    },
  ],
};
