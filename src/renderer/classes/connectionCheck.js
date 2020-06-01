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
    };
  }

  /**
   * Online/offline handler
   * @param {object} event – event
   * @returns {void}
   */
  async handleOnlineStatus(event) {
    const state = event.type === 'online';

    if (state) {
      if (this.notificationsIds.onlineStatus) {
        await store.dispatch('app/removeNotification', this.notificationsIds.onlineStatus);
        this.notificationsIds.onlineStatus = null;
      }
    } else {
      const notification = {
        infinite: true,
        preventSwipe: true,
        data: {
          text: 'It seems you are disconnected from the Internet',
        },
      };

      this.notificationsIds.onlineStatus = await store.dispatch('app/addNotification', notification);
    }
  }
}

export default new ConnectionCheck();
