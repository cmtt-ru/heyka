import Vue from 'vue';

/**
 * Retina image size multiplicator
 * @type {number}
 */
const retinaMultiplicator = 2;

/**
 * Checks if user has retina display
 *
 * @return {boolean}
 */
function isRetina() {
  return window.devicePixelRatio > 1;
}

/**
 * Apply image filter to leonardo url
 *
 * @param {string} src — leonardo image url
 * @param {number} width – image width
 * @param {number} height – image height
 * @param {string} scaleType – scale type, default `scale_scrop`, can be 'resize'
 * @return {string}
 */
function formImageUrl(src, width, height, scaleType = 'scale_crop') {
  if (!src.includes('leonardo.osnova')) {
    return src;
  }

  if (width === undefined) {
    return src;
  }

  if (height === undefined) {
    height = width;
  }

  if (isRetina()) {
    width *= retinaMultiplicator;
    height *= retinaMultiplicator;
  }

  return `${src}-/${scaleType}/${width}x${height}/center`;
}

Vue.filter('formImageUrl', formImageUrl);