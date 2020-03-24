import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';
import themes from '@/themes';
import API from '@api';
import SvgIcon from '@components/SvgIcon.vue';

Vue.prototype.$themes = themes; // TODO: убрать из глобал объекта
Vue.prototype.$API = API;
Vue.component('SvgIcon', SvgIcon);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
