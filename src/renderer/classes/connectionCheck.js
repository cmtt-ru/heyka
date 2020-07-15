import store from '@/store';
import i18n from '@/i18n';
import isOnline from 'is-online';
import sleep from 'es7-sleep';
import isMainWindow from '@shared/WindowManager/isMainWindow';

/**
 * Used for make some debounce for slow internet event
 * @type {number}
 */
const SLOW_INTERNET_INTERVAL = 2000;

/**
 * Used for internet connection check
 * @type {number}
 */
const INTERNET_CONNECTION_CHECK_INTERVAL = 5000;

/**
 * Connection checking class
 */
class ConnectionCheck {
  /**
   * Connection check contructor
   */
  constructor() {
    this.notificationsIds = {
      onlineStatus: null,
      slowInternet: null,
      socketReconnecting: null,
      serverAvailability: null,
    };

    this.slowInternetLastCallTime = null;

    if (isMainWindow()) {
      this.startInternetConnectionChecker();
    }
  }

  /**
   * Connection checker
   * @returns {Promise<void>}
   */
  async startInternetConnectionChecker() {
    while (true) {
      const state = await isOnline();

      this.handleOnlineStatus(state);
      await sleep(INTERNET_CONNECTION_CHECK_INTERVAL);
    }
  }

  /**
   * Online/offline handler
   *
   * @param {object} state – state
   * @returns {void}
   */
  async handleOnlineStatus(state) {
    const name = 'onlineStatus';

    if (state) {
      this.showNotification(name, false);
    } else {
      const notification = {
        infinite: true,
        preventSwipe: true,
        data: {
          text: this.getText(name),
        },
      };

      this.showNotification(name, true, notification);
    }
  }

  /**
   * Handle slow internet connection
   *
   * @param {boolean} state – slow or not
   * @returns {void}
   */
  async handleSlowInternet(state) {
    const name = 'slowInternet';
    const now = Date.now();

    if (this.slowInternetLastCallTime && now - this.slowInternetLastCallTime < SLOW_INTERNET_INTERVAL) {
      if (state) {
        const notification = {
          preventSwipe: true,
          data: {
            text: this.getText(name),
          },
        };

        this.showNotification(name, true, notification);
      } else {
        this.showNotification(name, false);
      }
    }

    this.slowInternetLastCallTime = now;
  }

  /**
   * Handle reconnecting socket
   *
   * @param {boolean} state – reconnecting or not
   * @returns {void}
   */
  async handleSocketReconnecting(state) {
    const name = 'socketReconnecting';

    if (state && this.notificationsIds.onlineStatus) {
      const notification = {
        preventSwipe: true,
        infinite: true,
        data: {
          text: this.getText(name),
        },
      };

      this.showNotification(name, true, notification);
    } else {
      this.showNotification(name, false);
    }
  }

  /**
   * Handle server availability
   *
   * @param {boolean} state – down or not
   * @returns {void}
   */
  async handleServerAvailability(state) {
    const name = 'serverAvailability';

    if (state) {
      this.showNotification(name, false);
    } else if (this.notificationsIds.onlineStatus) {
      const notification = {
        preventSwipe: true,
        infinite: true,
        data: {
          text: this.getText(name),
        },
      };

      this.showNotification(name, true, notification);
    }
  }

  /**
   * Show or hide in-app notifications
   *
   * @param {string} name – notofication name
   * @param {boolean} state – show or hide state
   * @param {object} [options] – notification options
   * @returns {Promise<void>}
   */
  async showNotification(name, state, options) {
    const nid = this.notificationsIds[name];

    if (state) {
      if (nid) {
        return;
      }

      this.notificationsIds[name] = await store.dispatch('app/addNotification', options);
    } else {
      if (nid) {
        await store.dispatch('app/removeNotification', this.notificationsIds[name]);
        this.notificationsIds[name] = null;
      }
    }
  }

  /**
   * Get needed texts from I18n-locale file
   * @param {string} name – key
   * @returns {Promise<*>}
   */
  getText(name) {
    return i18n.t(`connectionCheck.${name}`);
  }
}

export default new ConnectionCheck();
