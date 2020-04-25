import Vue from 'vue';
import textfade from './textFade';
import clickOutside from './clickOutside';
import popover from './popover';

Vue.directive('textfade', textfade);
Vue.directive('click-outside', clickOutside);
Vue.directive('popover', popover);
