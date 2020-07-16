import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import store from '@/store';
import sounds from '@classes/sounds';

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
  }

  /**
   * Show frame window
   * @returns {void}
   */
  show() {
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
   * Manage push window because of push add
   * @returns {void}
   */
  addPush() {
    this.amount++;
    this._newPushSupport();
    if (this.window === null) {
      this.show();
    } else {
      // resize to fit one extra notification in case some old notification is still in move-out transition
      this.window.setSize(ONE_PUSH_SIZE.width, TOP_MARGIN + ONE_PUSH_SIZE.height * Math.min(this.amount + 1, MAX_AMOUNT), 0);

      this.closewWindowTimeout = setTimeout(() => {
        this.window.setSize(ONE_PUSH_SIZE.width, TOP_MARGIN + ONE_PUSH_SIZE.height * Math.min(this.amount, MAX_AMOUNT), 0);
      }, PUSH_MOVEOUT_TIMER);
    }
  }

  /**
   * Manage push window because of push removal
   * @returns {void}
   */
  removePush() {
    this.amount--;
    if (this.amount === 0) {
      this.closewWindowTimeout = setTimeout(() => {
        this.window.action('close');
      }, PUSH_MOVEOUT_TIMER);
    } else {
      this.closewWindowTimeout = setTimeout(() => {
        this.window.setSize(ONE_PUSH_SIZE.width, TOP_MARGIN + ONE_PUSH_SIZE.height * Math.min(this.amount, MAX_AMOUNT), 0);
      }, PUSH_MOVEOUT_TIMER);
    }
  }

  /**
   * Secondary things to do on new push
   * @returns {void}
   */
  _newPushSupport() {
    clearTimeout(this.closewWindowTimeout);
    sounds.play('push');
  }

  /**
   * Hide push window
   * @returns {void}
   */
  hide() {
    if (this.window) {
      this.window.action('hide');
    }
  }
}

export default new PushWindow();
