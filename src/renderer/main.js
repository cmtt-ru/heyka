/* global buildRevision */
import '@sdk/Constants';
import HawkCatcher from '@hawk.so/javascript';
import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import themes from '@sdk/themes';
import i18n from '@sdk/translations/i18n';
import store from '@/store';
import API from '@api';
import SvgIcon from '@components/SvgIcon.vue';
import '@sdk/directives';
import { Mixin } from '@/mixins';
import permissions from '@sdk/classes/permissions';
import isMainWindow from '@sdk/libs/isMainWindow';
import network from '@sdk/classes/network';
import windowName from '@shared/WindowManager/currentWindowName';

themes.manualSetTheme('dark'); // TODO remove if light theme can be selected
store.dispatch('app/setLanguage', 'en');
/**
 * Retrieving log file path from main process
 */
const logPath = window.ipcRenderer.sendSync('log-manager-path', `renderer-${windowName()}`);

window.electronLog.transports.file.resolvePath = () => logPath;
window.electronLog.catchErrors();
Object.assign(console, window.electronLog.functions);

console.log(`\n\n

██╗    ██╗██╗███╗   ██╗██████╗  ██████╗ ██╗    ██╗     ██████╗ ██████╗ ███████╗███╗   ██╗███████╗██████╗
██║    ██║██║████╗  ██║██╔══██╗██╔═══██╗██║    ██║    ██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔════╝██╔══██╗
██║ █╗ ██║██║██╔██╗ ██║██║  ██║██║   ██║██║ █╗ ██║    ██║   ██║██████╔╝█████╗  ██╔██╗ ██║█████╗  ██║  ██║
██║███╗██║██║██║╚██╗██║██║  ██║██║   ██║██║███╗██║    ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██╔══╝  ██║  ██║
╚███╔███╔╝██║██║ ╚████║██████╔╝╚██████╔╝╚███╔███╔╝    ╚██████╔╝██║     ███████╗██║ ╚████║███████╗██████╔╝
 ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝  ╚══╝╚══╝      ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝╚══════╝╚═════╝
`);

if (IS_DEV) {
  Vue.config.performance = true;
}

if (isMainWindow()) {
  require('@classes/pushWindow');
  require('@classes/intercom');

  network.watchInternetState();
}

/**
 * Initialize Hawk error catcher
 */
if (process.env.VUE_APP_HAWK_TOKEN) {
  // eslint-disable-next-line no-new
  window.hawk = new HawkCatcher({
    token: process.env.VUE_APP_HAWK_TOKEN,
    vue: Vue,
    release: buildRevision,
  });
}

Vue.mixin(Mixin);
Vue.prototype.$themes = themes;
Vue.prototype.$API = API;
Vue.prototype.$permissions = permissions;
Vue.component('SvgIcon', SvgIcon);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
