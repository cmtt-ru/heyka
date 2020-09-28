import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import store from '@/store';
import sounds from '@sdk/classes/sounds';
import Logger from '@sdk/classes/logger';

const cnsl = new Logger('Push Window', '#a9ff71');

const ONE_PUSH_SIZE = {
  width: 368,
  height: 76,
};
const TOP_MARGIN = 12;
const PUSH_MOVEOUT_TIMER = 500;
const MAX_AMOUNT = 7;

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

    store.watch(() => store.getters['app/getPushes'], (pushes) => {
      this._changeAmount(pushes.length);
    });
  }

  /**
   * Show frame window
   * @returns {void}
   */
  _show() {
    if (this.window === null) {
      this.window = WindowManager.create({
        route: '/push-window',
        position: 'topRight',
        margin: 0,
        template: 'push',
        visibleOnAllWorkspaces: true,
        showInactive: true,
        window: {
          width: ONE_PUSH_SIZE.width,
          height: ONE_PUSH_SIZE.height + TOP_MARGIN,
        },
        onClose: () => {
          this.window = null;
        },

      });
    } else {
      this.window.action('showInactive');
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
    } else {
      // resize to fit one extra notification in case some old notification is still in move-out transition
      this.window.setSize(ONE_PUSH_SIZE.width, TOP_MARGIN + ONE_PUSH_SIZE.height * Math.min(length + 1, MAX_AMOUNT), 0);

      this.closewWindowTimeout = setTimeout(() => {
        this.window.setSize(ONE_PUSH_SIZE.width, TOP_MARGIN + ONE_PUSH_SIZE.height * Math.min(length, MAX_AMOUNT), 0);
      }, PUSH_MOVEOUT_TIMER);
    }
  }

  /**
   * Manage push window because of push removal
   *
   * @param {number} length - real amount of pushes
   * @returns {void}
   */
  _removePush(length) {
    if (length === 0) {
      cnsl.log('no pushes left');
      this.closewWindowTimeout = setTimeout(() => {
        this.window.action('close');
      }, PUSH_MOVEOUT_TIMER);
    } else {
      this.closewWindowTimeout = setTimeout(() => {
        this.window.setSize(ONE_PUSH_SIZE.width, TOP_MARGIN + ONE_PUSH_SIZE.height * Math.min(length, MAX_AMOUNT), 0);
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
