const STICKED_CLASS = 'ui-sticky';

/**
 * Decide if we need to update styles
 * @param {object} el element
 * @returns {void}
 */
function elementCheck(el) {
  console.log(el);
  if (el.intersectionRatio === 0) {
    el.target.classList.add(STICKED_CLASS);
  } else {
    el.target.classList.remove(STICKED_CLASS);
  }
}

const stickyObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    elementCheck(entry);
  }
});

export default {
  inserted: (el) => {
    stickyObserver.observe(el);
  },
  unbind: (el) => {
    stickyObserver.unobserve(el);
  },
};
