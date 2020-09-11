import { v4 as uuid4 } from 'uuid';

const STICKED_CLASS = 'ui-sticked';

const stickyObservers = {};

/**
 * Decide if we need to update styles
 * @param {object} el element
 * @returns {void}
 */
function elementCheck(el) {
  if (el.intersectionRatio === 1) {
    el.target.classList.add(STICKED_CLASS);
  } else {
    el.target.classList.remove(STICKED_CLASS);
  }
}

export default {
  inserted: (el) => {
    const id = uuid4();

    stickyObservers[id] = new IntersectionObserver(entries => {
      for (const entry of entries) {
        elementCheck(entry);
      }
    }, {
      root: el.parentElement,
      threshold: 1,
    });
    stickyObservers[id].observe(el);
    el.setAttribute('sticky-instance-uid', id);
    el.style.position = 'sticky';
    el.style.top = '0';
    el.style.zIndex = '1';
    el.style.transform = 'translateY(-0.1px)';
  },

  unbind: (el) => {
    const id = el.getAttribute('sticky-instance-uid');

    stickyObservers[id].unobserve(el);
    delete stickyObservers[id];
  },
};
