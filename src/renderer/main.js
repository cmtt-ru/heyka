/* global buildRevision */
import '@shared/Constants';
import HawkCatcher from '@hawk.so/javascript';
import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import themes from '@/themes';
import i18n from '@/i18n';
import store from '@/store';
import API from '@api';
import SvgIcon from '@components/SvgIcon.vue';
import '@/filters/leonardo';
import '@/directives';
import { Mixin } from '@/mixins';
import permissions from '@classes/permissions';

import '@classes/SpeedTest';

/**
 * Initialize Hawk error catcher
 */
if (process.env.VUE_APP_HAWK_TOKEN) {
  // eslint-disable-next-line no-new
  new HawkCatcher({
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
