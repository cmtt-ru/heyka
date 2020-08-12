/**
 * Retina image size multiplicator
 * @type {number}
 */
export const RETINA_MULTIPLICATOR = 2;

/**
 * Checks if user has retina display
 *
 * @returns {boolean}
 */
export function isRetina() {
  return window.devicePixelRatio > 1;
}

/**
 * Apply image filter to leonardo url
 *
 * @param {string} src — leonardo image url
 * @param {number} width – image width
 * @param {number} height – image height
 * @param {string} scaleType – scale type, default `scale_scrop`, can be 'resize'
 * @returns {string}
 */
export function formImageUrl(src, width, height, scaleType = 'scale_crop') {
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
    width *= RETINA_MULTIPLICATOR;
    height *= RETINA_MULTIPLICATOR;
  }

  return `${src}-/${scaleType}/${width}x${height}/center`;
}
