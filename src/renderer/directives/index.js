import Vue from 'vue';
import textfade from './textFade';
import clickOutside from './clickOutside';
import popover from './popover';
import { Draggable } from 'draggable-vue-directive';

Vue.directive('textfade', textfade);
Vue.directive('click-outside', clickOutside);
Vue.directive('popover', popover);
Vue.directive('draggable', Draggable);
