/* eslint-disable no-magic-numbers */

/**
 * A class that handles all windows
 */
class Logger {
  /**
   * Inits window manager class, assigns mainwindow
   * @param {string} module - module name
   * @param {string} background - background color
   */
  constructor(module = 'logger', background = '#fff') {
    this.module = module.toUpperCase();
    this.background = background;
    this.color = this._contrastColor(background);
  }

  /**
   * custom console log
   * @returns {void}
   */
  log() {
    console.log(`%c ${this.module}: `, `background: ${this.background};color: ${this.color}; font-weight: bold`, ...arguments);
  }

  /**
   * important console log
   * @returns {void}
   */
  info() {
    console.log(`%c ${this.module}: `, `background: ${this.background};color: ${this.color}; font-weight: bold; font-size: 1.1rem;`, ...arguments);
  }

  /**
   * important console log
   * @returns {void}
   */
  error() {
    console.error(`%c ${this.module}: `, `background: ${this.background};color: ${this.color}; font-weight: bold`, ...arguments);
  }

  /**
   * debug log. will appear only in DEV.
   * @returns {void}
   */
  debug() {
    if (!IS_DEV || process.env.VUE_APP_DEBUG !== false) {
      return;
    }
    this.log(arguments);
  }

  /**
 * Determines which color (black or white) looks better on given background
 * @param {string} bg - background color
 * @returns {string} black or white color
 */
  _contrastColor(bg) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

    bg = bg.replace(shorthandRegex, function (m, r, g, b) {
      return '#' + r + r + g + g + b + b;
    });
    const r = parseInt(bg.substring(1, 2), 16);
    const g = parseInt(bg.substring(3, 2), 16);
    const b = parseInt(bg.substring(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return (yiq >= 128) ? '#000' : '#fff';
  }
}

export default Logger;