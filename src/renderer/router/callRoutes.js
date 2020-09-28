const CallWindow = () => import(/* webpackChunkName: "call" */ '@views/CallWindow');
const CallWindowMain = () => import(/* webpackChunkName: "call" */ '@sdk/views/Call/Grid');
const CallWindowExpanded = () => import(/* webpackChunkName: "call" */ '@sdk/views/Call/Expanded');

const CallOverlayWindow = () => import(/* webpackChunkName: "call" */ '@views/CallOverlayWindow');
const CallOverlayWindowMain = () => import(/* webpackChunkName: "call" */ '@views/CallOverlayWindow/Call');

const CallSharingWindow = () => import(/* webpackChunkName: "call" */ '@views/CallSharingWindow');
const CallSharingWindowMain = () => import(/* webpackChunkName: "call" */ '@views/CallSharingWindow/Sharing');

export const callRoutes = [ {
  path: '/call-overlay',
  component: CallOverlayWindow,
  children: [
    {
      path: '',
      component: CallOverlayWindowMain,
    },
  ],
},

{
  path: '/call-sharing',
  component: CallSharingWindow,
  children: [
    {
      path: '',
      component: CallSharingWindowMain,
    },
  ],
},

{
  path: '/call-window',
  component: CallWindow,
  children: [
    {
      path: '',
      component: CallWindowMain,
    },
    {
      path: 'expanded/:id',
      component: CallWindowExpanded,
    },
  ],
} ];