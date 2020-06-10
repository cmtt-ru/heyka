
/**
 * Decide on el resize if we should add custom fade
 */

const STYLE_DEFAULT = {
  whiteSpace: 'nowrap',
};

const STYLE_FADE = {
  webkitMaskImage: 'linear-gradient(-90deg, transparent, transparent 10px, currentColor 30px)',
};

const STYLE_NOFADE = {
  webkitMaskImage: null,
};

/**
 * Decide if we need to update styles
 * @param {object} el element
 * @returns {void}
 */
function elementCheck(el) {
  if (el.offsetWidth < el.scrollWidth) {
    if (!el.style.webkitMaskImage) {
      addStyles(el, STYLE_FADE);
    }
  } else if (el.style.webkitMaskImage) {
    addStyles(el, STYLE_NOFADE);
  }
}

/**
 * Add needed Styles to element
 * @param {object} el element
 * @param {object} stylesheet stylesheet
 * @returns {void}
 */
function addStyles(el, stylesheet) {
  for (const style in stylesheet) {
    el.style[style] = stylesheet[style];
  }
}

const fadeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    elementCheck(entry.target);
  }
});

export default {
  inserted: (el) => {
    addStyles(el, STYLE_DEFAULT);
    fadeObserver.observe(el);
  },
  componentUpdated: (el, binding) => {
    if (binding.value && binding.value === binding.oldValue) {
      return;
    }
    elementCheck(el);
  },
  unbind: (el) => {
    fadeObserver.unobserve(el);
  },
};
