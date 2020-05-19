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

Vue.prototype.$themes = themes;
Vue.prototype.$API = API;
Vue.component('SvgIcon', SvgIcon);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
