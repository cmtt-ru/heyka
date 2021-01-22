const Workspace = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace');
const Channel = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/Channel');
const User = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/User');
const WorkspaceEmpty = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/Empty');
const DrawingTest = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/DrawingTest');
// const EditProfile = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/EditProfile');
const EditChannel = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/EditChannel');
const Invite = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/Workspace/Invite');

const EditProfile = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/EditProfile/index.vue');
const EditProfileMain = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/EditProfile/EditProfile');
const EditProfileSocial = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/EditProfile/Social');

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
      path: 'edit-profile',
      component: EditProfile,
      children: [
        {
          path: '',
          name: 'edit-profile-main',
          component: EditProfileMain,
        },
        {
          path: 'social',
          name: 'edit-profile-social',
          component: EditProfileSocial,
        },
      ],
    },
    {
      path: 'drawing',
      name: 'drawing',
      component: DrawingTest,
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
    {
      path: 'invite',
      name: 'invite',
      component: Invite,
    },
  ],
};
