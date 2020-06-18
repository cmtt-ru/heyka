import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import store from '@/store';

const ONE_PUSH_SIZE = {
  width: 368,
  height: 76,
};
const TOP_MARGIN = 12;
const PUSH_MOVEOUT_TIMER = 500;
const MAX_AMOUNT = 7;

/**
 * Audio element for audio test
 * @type {HTMLAudioElement}
 */
const audioNewPush = new Audio(require('@assets/audio/push.mp3'));

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
    this.notifications = 0;
  }

  /**
   * Show frame window
   * @param {string} displayId – display id
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
      audioNewPush.setSinkId(this._selectedSpeaker());
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
   * Resize push window depending on number of pushes
   * @param {number} amount number of pushes
   * @returns {void}
   */
  updateCount(amount) {
    if (amount === 0) {
      this.closewWindowTimeout = setTimeout(() => {
        this.window.action('close');
      }, PUSH_MOVEOUT_TIMER);
    } else if (this.window === null) {
      this.show();
      this._newPushSupport();
    } else {
      if (this.notifications < amount) {
        this._newPushSupport();
        this.window.setSize(ONE_PUSH_SIZE.width, TOP_MARGIN + ONE_PUSH_SIZE.height * Math.min(amount + 1, MAX_AMOUNT), 0);
        this.closewWindowTimeout = setTimeout(() => {
          this.window.setSize(ONE_PUSH_SIZE.width, TOP_MARGIN + ONE_PUSH_SIZE.height * Math.min(amount, MAX_AMOUNT), 0);
        }, PUSH_MOVEOUT_TIMER);
      } else {
        this.closewWindowTimeout = setTimeout(() => {
          this.window.setSize(ONE_PUSH_SIZE.width, TOP_MARGIN + ONE_PUSH_SIZE.height * Math.min(amount, MAX_AMOUNT), 0);
        }, PUSH_MOVEOUT_TIMER);
      }
    }
    this.notifications = amount;
  }

  /**
   * Secondary things to do on new push
   * @returns {void}
   */
  _newPushSupport() {
    clearTimeout(this.closewWindowTimeout);
    audioNewPush.play();
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
