import Vue from 'vue';
import textfade from './textFade';
import clickOutside from './clickOutside';
import sticky from './sticky';
import popover from './popover';
import { Draggable } from 'draggable-vue-directive';
import tooltip from './tooltip';
import stopPropagation from './stopPropagation';

Vue.directive('textfade', textfade);
Vue.directive('click-outside', clickOutside);
Vue.directive('sticky', sticky);
Vue.directive('popover', popover);
Vue.directive('draggable', Draggable);
Vue.directive('tooltip', tooltip);
Vue.directive('stop-propagation', stopPropagation);
