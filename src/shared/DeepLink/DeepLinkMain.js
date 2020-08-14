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
    this.lastUrl = null;
    this.isResent = false;

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
      this.winParse();

      const gotTheLock = app.requestSingleInstanceLock();

      if (gotTheLock) {
        app.on('second-instance', (event, argv) => {
          this.winParse(argv);
          event.preventDefault();
        });
      } else {
        app.quit();
      }
    }
  }

  /**
   * Get heyka deeplink from window args (WIN only)
   *
   * @param {array} argv – process flags (deep link included)
   * @returns {void}
   */
  winParse(argv = process.argv) {
    const deepLinkFlag = argv.find(el => el.includes('heyka://'));

    if (deepLinkFlag === undefined) {
      return;
    }

    this.deepLinkHandler(deepLinkFlag);
  }

  /**
   * Deep link event handler
   * @param {string} url – deep link url
   * @returns {void}
   */
  deepLinkHandler(url) {
    const urlPaths = this.parseUrl(url);

    if (urlPaths) {
      if (this.isCommandAllowed(urlPaths.command)) {
        this.lastUrl = url;
        if (this.mainWindow) {
          this.mainWindow.webContents.send('deep-link', urlPaths);

          /** Do some stuff to show & focus main window */
          if (this.mainWindow.isMinimized()) {
            this.mainWindow.restore();
          }

          this.mainWindow.show();
          this.mainWindow.focus();
        }

        return;
      }
    }

    console.log(`deep link doesn't pass: ${url}`);
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
   * Resend last url
   * @returns {void}
   */
  resendLast() {
    if (!this.isResent) {
      this.isResent = true;
      if (this.lastUrl) {
        this.deepLinkHandler(this.lastUrl);
      }
    }
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

export default new DeepLinkMain(['focus', 'login', 'social-link']);
