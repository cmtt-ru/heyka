
/**
 * Decide on el resize if we should add custom fade
 */

const STYLE_DEFAULT = {
  whiteSpace: 'nowrap',
};

const STYLE_FADE = {
  backgroundImage: '-webkit-linear-gradient(180deg, transparent, transparent 10px, currentColor 30px)',
  webkitBackgroundClip: 'text',
  webkitTextFillColor: 'transparent',
};

const STYLE_NOFADE = {
  backgroundImage: null,
  webkitBackgroundClip: null,
  webkitTextFillColor: 'currentColor',
};

/**
 * Decide if we need to update styles
 * @param {object} el element
 * @returns {void}
 */
function elementCheck(el) {
  if (el.offsetWidth < el.scrollWidth) {
    if (el.style.webkitBackgroundClip !== 'text') {
      addStyles(el, STYLE_FADE);
    }
  } else if (el.style.webkitBackgroundClip === 'text') {
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

/**
 * We need to repaint backgroundImage if text hs changed in place
 * @param {object} el element
 * @returns {void}
 */
function reflowElement(el) {
  const paddingTop = el.style.paddingTop || getComputedStyle(el).paddingTop;

  // eslint-disable-next-line no-magic-numbers
  el.style.paddingTop = parseFloat(paddingTop) + 0.01 + 'px';
  // eslint-disable-next-line no-unused-vars
  const trick = el.offsetHeight;

  el.style.paddingTop = paddingTop;
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
    reflowElement(el);
    elementCheck(el);
  },
  unbind: (el) => {
    fadeObserver.unobserve(el);
  },
};
