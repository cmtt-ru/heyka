import { screen } from 'electron';
import { IS_WIN } from '../../main/Constants';

const directions = {
  LEFT: 1,
  RIGHT: 2,
  TOP: 3,
  LEFTTOP: 4,
  RIGHTTOP: 5,
  BOTTOM: 6,
  BOTTOMLEFT: 7,
  BOTTOMRIGHT: 8,
};

const DEFAULT_MAX_SIZE = 1000;

const RESIZING_HOOK = 0x0214;
let resizeDirection;

/**
 * Сlass that handles window aspect ratio preservance
 */
export default class AspectRatio {
  /**
    * Init
    * @param {object} window - window object
    * @param {number} aspectRatio - aspect ratio
    * @param {number} extraWidth - extra width not included in aspect ratio preservance
    * @param {number} extraHeight - extra height not included in aspect ratio preservance
    * @param {number} maxWidth - max width
    * @param {number} maxHeight - max height
  */
  constructor(window, aspectRatio, extraWidth = 0, extraHeight = 0, maxWidth = DEFAULT_MAX_SIZE, maxHeight = DEFAULT_MAX_SIZE) {
    this.window = window;
    this.aspectRatio = aspectRatio;
    this.extraWidth = extraWidth;
    this.extraHeight = extraHeight;
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;

    console.log('AspectRatio -->', aspectRatio, extraWidth, extraHeight, maxWidth, maxHeight);

    if (IS_WIN) {
      this.window.hookWindowMessage(RESIZING_HOOK, (wParam) => {
        resizeDirection = wParam.readUIntBE(0, 1);
      });
    }

    this.window.on('will-resize', (event, screenBounds) => {
      event.preventDefault();
      this.preserveAspectRatio(screenBounds);
    });
  }

  /**
   * Get height of window based on width and aspect ratio
   *
   * @param {number} width - width of window
   * @returns {number} height
   */
  getHeight(width) {
    return Math.min(this.maxHeight, Math.floor((width - this.extraWidth) / this.aspectRatio + this.extraHeight));
  }

  /**
   * Get width of window based on height and aspect ratio
   *
   * @param {number} height - height of window
   * @returns {number} width
   */
  getWidth(height) {
    return Math.min(this.maxWidth, Math.floor((height - this.extraHeight) * this.aspectRatio + this.extraWidth));
  }

  /**
   * Determine the direction of resizing (if not Windows)
   *
   * @param {object} newBounds - new theoretical bounds after resize
   * @returns {number} width
   */
  calcResizeDirection(newBounds) {
    const oldBounds = this.window.getBounds();

    const deltaStart = [oldBounds.x !== newBounds.x, oldBounds.y !== newBounds.y];
    const deltaEnd = [!deltaStart[0] && (oldBounds.width !== newBounds.width),
      !deltaStart[1] && (oldBounds.height !== newBounds.height)];

    // eslint-disable-next-line no-magic-numbers
    resizeDirection = deltaStart[0] * 1 + deltaStart[1] * 3 + deltaEnd[0] * 2 + deltaEnd[1] * 6;
  }

  /**
   * Main calc function to resize window based on aspect ratio and direction of resize
   *
   * @param {object} screenBounds - screenBounds
   * @returns {number} width
   */
  preserveAspectRatio(screenBounds) {
    //! NOT WIRKING ON NON-100% SCALE SCREENS! NEED FIX!
    const rawBounds = screen.screenToDipRect(this.window, screenBounds);
    const newBounds = { ...rawBounds };

    const [minWidth, minHeight] = this.window.getMinimumSize();

    if (newBounds.width < minWidth || newBounds.height < minHeight) {
      return;
    }

    let tempWidth;
    let tempHeight;
    const toBounds = { ...newBounds };

    if (resizeDirection === 0) {
      return;
    }

    switch (resizeDirection) {
      case directions.LEFT:
      case directions.RIGHT:
        toBounds.height = this.getHeight(newBounds.width);
        break;
      case directions.TOP:
      case directions.BOTTOM:
        toBounds.width = this.getWidth(newBounds.height);
        break;
      case directions.BOTTOMLEFT:
      case directions.BOTTOMRIGHT:
      case directions.LEFTTOP:
      case directions.RIGHTTOP:
        toBounds.width = this.getWidth(newBounds.height);
        tempWidth = newBounds.width;
        tempHeight = this.getHeight(tempWidth);
        if (tempWidth * tempHeight > toBounds.width * toBounds.height) {
          toBounds.width = tempWidth;
          toBounds.height = tempHeight;
        }
        break;
      default:
    }

    switch (resizeDirection) {
      case directions.BOTTOMLEFT:
        toBounds.x = newBounds.x + newBounds.width - toBounds.width;
        break;
      case directions.LEFTTOP:
        toBounds.x = newBounds.x + newBounds.width - toBounds.width;
        toBounds.y = newBounds.y + newBounds.height - toBounds.height;
        break;
      case directions.RIGHTTOP:
        toBounds.y = newBounds.y + newBounds.height - toBounds.height;
        break;
      default:
    }
    this.window.setBounds(toBounds);
  }
}
