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
import '@sdk/filters/leonardo';
import '@sdk/directives';
import { Mixin } from '@/mixins';
import permissions from '@classes/permissions';
import isMainWindow from '@shared/WindowManager/isMainWindow';
import '@classes/SpeedTest';

if (isMainWindow()) {
  require('@classes/pushWindow');
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
