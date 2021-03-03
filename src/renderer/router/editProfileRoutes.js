const EditProfile = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/EditProfile/index.vue');
const EditProfileMain = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/EditProfile/EditProfile');
const EditProfileSocial = () => import(/* webpackChunkName: "main" */ '@views/MainWindow/EditProfile/Social');

export const editProfileRoutes = {
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
};
