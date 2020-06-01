import store from '@/store';

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
    };
  }

  /**
   * Online/offline handler
   *
   * @param {object} event – event
   * @returns {void}
   */
  async handleOnlineStatus(event) {
    const state = event.type === 'online';

    if (state) {
      this.showNotification('onlineStatus', false);
    } else {
      const notification = {
        infinite: true,
        preventSwipe: true,
        data: {
          text: 'It seems you are disconnected from the Internet',
        },
      };

      this.showNotification('onlineStatus', true, notification);
    }
  }

  /**
   * Handle slow internet connection
   *
   * @param {boolean} state – slow or not
   * @returns {void}
   */
  async handleSlowInternet(state) {
    if (state) {
      const notification = {
        preventSwipe: true,
        data: {
          text: 'It seems you have a slow Internet connection',
        },
      };

      this.showNotification('slowInternet', true, notification);
    } else {
      this.showNotification('slowInternet', false);
    }
  }

  /**
   * Handle reconnecting socket
   *
   * @param {boolean} state – slow or not
   * @returns {void}
   */
  async handleSocketReconnecting(state) {
    if (state) {
      const notification = {
        preventSwipe: true,
        infinite: true,
        data: {
          text: 'Trying to reconnect to socket server',
        },
      };

      this.showNotification('socketReconnecting', true, notification);
    } else {
      this.showNotification('socketReconnecting', false);
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
}

export default new ConnectionCheck();
