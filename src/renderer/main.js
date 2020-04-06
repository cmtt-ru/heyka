import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';
import themes from '@/themes';
import API from '@api';
import SvgIcon from '@components/SvgIcon.vue';
import './filters/leonardo';

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

/**
 * Decide on el resize if we should add custom fade text-overflow
 */
const fadeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    if (entry.target.offsetWidth < entry.target.scrollWidth) {
      entry.target.classList.add('text-overflow');
    } else {
      entry.target.classList.remove('text-overflow');
    }
  }
});

Vue.directive('textfade', {
  inserted: (el) => {
    fadeObserver.observe(el);
  },
  unbind: (el) => {
    fadeObserver.unobserve(el);
  },

});