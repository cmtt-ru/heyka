/**
 * Check's that current window is main window
 * @returns {boolean}
 */
const isMainWindow = window.navigator.userAgent.split(' ').includes('is-main-window');

/**
 * return true if is MainWindow
 *
 * @returns {void}
 */
export default function () {
  return isMainWindow;
};
