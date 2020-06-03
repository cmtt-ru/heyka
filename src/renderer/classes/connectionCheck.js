import store from '@/store';
import i18n from '@/i18n';

/**
 * User for make some debounce for slow internet event
 * @type {number}
 */
const SLOW_INTERNET_INTERVAL = 2000;

/**
 * Connection checking class
 */
class ConnectionCheck {
  /**
   * Connection check contructor
   */
  constructor() {
    window.addEventListener('online', this.handleOnlineStatus.bind(this));
    window.addEventListener('offline', this.handleOnlineStatus.bind(this));

    this.notificationsIds = {
      onlineStatus: null,
      slowInternet: null,
      socketReconnecting: null,
      serverAvailability: null,
    };

    this.slowInternetLastCallTime = null;
  }

  /**
   * Online/offline handler
   *
   * @param {object} event – event
   * @returns {void}
   */
  async handleOnlineStatus(event) {
    const name = 'onlineStatus';
    const state = event.type === 'online';

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

    if (state && !this.notificationsIds.onlineStatus) {
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

    if (state && !this.notificationsIds.onlineStatus) {
      this.showNotification(name, false);
    } else {
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
        await this.showNotification(name, false);
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
