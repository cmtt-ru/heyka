/* eslint-disable no-magic-numbers */

const DEFAULT_STYLE = 'font-size: 0.7rem; font-weight: 700; font-family: Helvetica; padding: 3px 5px 2px; border-radius: 5px; margin: 4px 2px';

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
    this.style = `background: ${this.background}; color: ${this.color}; ${DEFAULT_STYLE}`;
  }

  /**
   * custom console log
   * @returns {void}
   */
  log() {
    console.log(`%c${this.module}`, this.style, ...arguments);
  }

  /**
   * important console log
   * @returns {void}
   */
  info() {
    console.log(`⚠️ %c${this.module}`, this.style, ...arguments);
  }

  /**
   * important console log
   * @returns {void}
   */
  error() {
    console.error(`%c${this.module}`, this.style, ...arguments);
  }

  /**
   * debug log. will appear only in DEV and only if VUE_APP_DEBUG is true
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
    const r = parseInt(bg.substring(1, 3), 16);
    const g = parseInt(bg.substring(3, 5), 16);
    const b = parseInt(bg.substring(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return (yiq >= 150) ? '#000' : '#fff';
  }
}

export default Logger;