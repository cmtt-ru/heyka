import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import store from '@/store';
import sounds from '@sdk/classes/sounds';
import Logger from '@sdk/classes/logger';

const cnsl = new Logger('Push Window', '#a9ff71');

const PUSH_MOVEOUT_TIMER = 500;

/**
 * Class for controlling push window
 */
class PushWindow {
  /**
   * Call window constructor
   */
  constructor() {
    this.window = null;
    this.closewWindowTimeout = null;
    this.amount = 0;

    store.watch(() => store.getters['app/getPushesCount'], count => {
      this._changeAmount(count);
    });
  }

  /**
   * Show push window
   * @returns {void}
   */
  async _show() {
    if (this.window === null) {
      this.window = await WindowManager.create({
        route: '/push-window',
        position: 'topRight',
        margin: 0,
        template: 'push',
        maxAvailHeight: true,
        visibleOnAllWorkspaces: true,
        showInactive: true,
        onClose: () => {
          this.window = null;
        },

      });
    } else {
      await this.window.action('showInactive');
    }
  }

  /**
   * Selected speakes
   * @returns {string}
   */
  _selectedSpeaker() {
    return store.getters['app/getSelectedDevices'].speaker;
  }

  /**
   * Manage push window size
   *
   * @param {number} length - real amount of pushes
   * @returns {void}
   */
  _changeAmount(length) {
    if (length > this.amount) {
      this._addPush(length);
    } else {
      this._removePush(length);
    }
    this.amount = length;
  }

  /**
   * Manage push window because of push add
   *
   * @param {number} length - real amount of pushes
   * @returns {void}
   */
  _addPush(length) {
    this._newPushSupport();
    if (this.window === null) {
      this._show();
    }
  }

  /**
   * Manage push window because of push removal
   *
   * @param {number} length - real amount of pushes
   * @returns {void}
   */
  _removePush(length) {
    if (length === 0 && this.window) {
      cnsl.log('no pushes left');
      this.closewWindowTimeout = setTimeout(() => {
        this.window.action('close');
      }, PUSH_MOVEOUT_TIMER);
    }
  }

  /**
   * Secondary things to do on new push
   * @returns {void}
   */
  _newPushSupport() {
    clearTimeout(this.closewWindowTimeout);
    cnsl.log('cleared timeout for push window resize');
    sounds.play('push');
  }
}

export default new PushWindow();
