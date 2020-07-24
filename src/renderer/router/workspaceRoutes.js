const Workspace = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace');
const Channel = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/Channel');
const User = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/User');
const WorkspaceEmpty = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/Empty');
const DrawingTest = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/DrawingTest');
const TestPseudoPopup = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/TestPseudoPopup');
const EditChannel = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/EditChannel');

export const workspaceRoutes = {
  path: 'workspace',
  component: Workspace,
  children: [
    {
      path: '',
      name: 'workspace',
      component: WorkspaceEmpty,
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
    {
      path: 'drawing',
      name: 'drawing',
      component: DrawingTest,
    },
    {
      path: 'test-pseudo-popup',
      name: 'test-pseudo-popup',
      component: TestPseudoPopup,
    },
    {
      path: 'create-channel',
      name: 'create-channel',
      component: EditChannel,
    },
    {
      path: 'edit-channel/:id',
      name: 'edit-channel',
      component: EditChannel,
    },
  ],
};
