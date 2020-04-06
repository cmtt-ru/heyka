import Vue from 'vue';

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