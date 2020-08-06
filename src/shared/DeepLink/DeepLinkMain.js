import { app } from 'electron';
import { IS_MAC } from '../../shared/Constants';

/**
 * A class that handles Deep Links in main process
 */
class DeepLinkMain {
  /**
   * Deep link class
   * @param {array} commandsArray – legitimate commands
   */
  constructor(commandsArray) {
    this.commands = commandsArray;
    this.mainWindow = null;
    this.lastUrlPaths = null;

    app.on('will-finish-launching', () => {
      this.bindEvents();
    });
  }

  /**
   * Bind deep link events for different OS
   * @returns {void}
   */
  bindEvents() {
    if (IS_MAC) {
      app.on('open-url', (event, url) => {
        this.deepLinkHandler(url);
        event.preventDefault();
      });
    } else {
      const gotTheLock = app.requestSingleInstanceLock();

      if (gotTheLock) {
        app.on('second-instance', (event, argv) => {
          this.deepLinkHandler(argv[1]);
          event.preventDefault();
        });
      } else {
        app.quit();
      }
    }
  }

  /**
   * Deep link event handler
   * @param {string} url – deep link url
   * @returns {void}
   */
  deepLinkHandler(url) {
    console.log('deep link:', url);
    const urlPaths = this.parseUrl(url);

    if (urlPaths) {
      if (this.isCommandAllowed(urlPaths.command)) {
        if (this.mainWindow) {
          this.mainWindow.webContents.send('deep-link', urlPaths);

          this.lastUrlPaths = urlPaths;

          /** Do some stuff to show & focus main window */
          if (this.mainWindow.isMinimized()) {
            this.mainWindow.restore();
          }

          this.mainWindow.show();
          this.mainWindow.focus();

          return;
        }
      }
    }

    console.log(`deep link doesn't pass`);
  }

  /**
   * Transforms deep link string to command & url paths
   * @param {string} str – deep link string
   * @returns {object}
   */
  parseUrl(str) {
    if (str.indexOf('heyka://') === -1) {
      return;
    }

    /** Remove app name, eg: `heyka://` */
    let paths = str.split('://')[1];

    /** Make array of url components */
    paths = paths.split('/');

    return {
      command: paths.shift(),
      paths: paths,
    };
  }

  /**
   * Check's that command is allowed
   * @param {string} command – deep link command
   * @returns {boolean}
   */
  isCommandAllowed(command) {
    return this.commands.includes(command);
  }

  /**
   * Add mainWindow instance to deepLink object
   * @param {BrowserWindow} window – main window instance
   * @returns {void}
   */
  bindMainWindow(window) {
    this.mainWindow = window;
  }
}

export default new DeepLinkMain(['invite', 'call', 'join', 'login']);
