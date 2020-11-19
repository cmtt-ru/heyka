import { screen } from 'electron';

const Directions = {
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

    console.log(aspectRatio, extraWidth, extraHeight, maxWidth, maxHeight);

    this.window.hookWindowMessage(RESIZING_HOOK, (wParam) => {
      resizeDirection = wParam.readUIntBE(0, 1);
    });

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
   * Main calc function to resize window based on aspect ratio and direction of resize
   *
   * @param {object} screenBounds - screenBounds
   * @returns {number} width
   */
  preserveAspectRatio(screenBounds) {
    const rawBounds = screen.screenToDipRect(this.window, screenBounds);
    const newBounds = { ...rawBounds };

    let tempWidth;
    let tempHeight;
    const toBounds = { ...newBounds };

    switch (resizeDirection) {
      case Directions.LEFT:
      case Directions.RIGHT:
        toBounds.height = this.getHeight(newBounds.width);
        break;
      case Directions.TOP:
      case Directions.BOTTOM:
        toBounds.width = this.getWidth(newBounds.height);
        break;
      case Directions.BOTTOMLEFT:
      case Directions.BOTTOMRIGHT:
      case Directions.LEFTTOP:
      case Directions.RIGHTTOP:
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
      case Directions.BOTTOMLEFT:
        toBounds.x = newBounds.x + newBounds.width - toBounds.width;
        break;
      case Directions.LEFTTOP:
        toBounds.x = newBounds.x + newBounds.width - toBounds.width;
        toBounds.y = newBounds.y + newBounds.height - toBounds.height;
        break;
      case Directions.RIGHTTOP:
        toBounds.y = newBounds.y + newBounds.height - toBounds.height;
        break;
      default:
    }
    this.window.setBounds(toBounds);
  }
}