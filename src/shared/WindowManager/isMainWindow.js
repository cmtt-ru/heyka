/**
 * Check's that current window is main window
 * @returns {boolean}
 */
const isMainWindow = process.argv.includes('--is-main-window');

export default function () {
  return isMainWindow;
};
