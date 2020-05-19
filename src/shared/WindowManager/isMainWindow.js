import { ipcRenderer } from 'electron';

/**
 * Check's that current window is main window
 * @returns {boolean}
 */
export default function () {
  let windowId = process.argv.find(argv => argv.indexOf('--window-id') === 0);

  if (windowId) {
    windowId = windowId.split('=')[1];
  }

  return ipcRenderer.sendSync('window-manager-is-main-window', {
    id: windowId,
  });
};
