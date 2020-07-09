const Workspace = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace');
const Channel = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/Channel');
const User = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/User');
const WorkspaceEmpty = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/Empty');
// const TestWorkspace = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/Workspace');

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
  ],
};