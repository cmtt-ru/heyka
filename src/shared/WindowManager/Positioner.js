'use strict';

import { screen } from 'electron';
import TrayManager from '../../main/classes/TrayManager';
import { IS_LINUX } from '../../sdk/Constants';

const DEFAULT_MARGIN = 0;

/**
 * Сlass that handles window position
 */
export default class Positioner {
  /**
   * Init
   * @param {object} browserWindow - browserWindow object
   * @param {number} margin - minimal distance from window bounds to screen bounds
   */
  constructor(browserWindow, margin = DEFAULT_MARGIN) {
    this.browserWindow = browserWindow;
    this.margin = margin;
  }

  /**
   * move window to position
   * @param {object} position - position
   * @return {void}
   */
  move(position) {
    const coords = this._getCoords(position);

    this.browserWindow.setPosition(coords.x, coords.y);
  }

  /**
   * move window to XY coordinates on screen with id
   * @param {object} params - {x,y, id}
   * @return {void}
   */
  moveXYscreen(params) {
    const display = screen.getAllDisplays().find(el => el.id === params.id) || screen.getPrimaryDisplay();

    const finalPos = this._marginAdjust({
      x: params.x + display.workArea.x,
      y: params.y + display.workArea.y,
    }, this.browserWindow.getBounds(), display.workArea);

    console.log('retrieving:', finalPos);

    this.browserWindow.setPosition(display.workArea.x, display.workArea.y);
    this.browserWindow.setPosition(finalPos.x, finalPos.y);
  }

  /**
   * resize window (make it not bigget than screen)
   * @param {object} params - {size, id}
   * @return {void}
   */
  resize(params) {
    const display = screen.getAllDisplays().find(el => el.id === params.id) || screen.getPrimaryDisplay();
    const width = Math.min(display.workArea.width, params.size[0]);
    const height = Math.min(display.workArea.height, params.size[1]);

    this.browserWindow.setSize(width, height);
  }

  /**
   * calculate window position
   * @param {object} position - position
   * @return {object} final coordinates of window: {x:_, y:_}
   */
  calculate(position) {
    const coords = this._getCoords(position);

    return {
      x: coords.x,
      y: coords.y,
    };
  }

  /**
   * calculate window position according to passed string
   * @param {string} position - text description of window position (eg. 'bottomRight')
   * @return {object} final coordinates of window: {x:_, y:_}
   */
  _getCoords(position) {
    const activeScreen = this._getScreen(position);
    const screenBounds = activeScreen.workArea;
    const windowBounds = this.browserWindow.getBounds();

    let pos;

    switch (position) {
      case 'tray': pos = this._trayCoords(activeScreen, windowBounds);
        break;
      case 'topLeft':
        pos = {
          x: screenBounds.x,
          y: screenBounds.y,
        };
        break;
      case 'topRight':
        pos = {
          x: Math.floor(screenBounds.x + (screenBounds.width - windowBounds.width)),
          y: screenBounds.y,
        };
        break;
      case 'bottomLeft':
        pos = {
          x: screenBounds.x,
          y: Math.floor(screenBounds.height - (windowBounds.height - screenBounds.y)),
        };
        break;
      case 'bottomRight':
        pos = {
          x: Math.floor(screenBounds.x + (screenBounds.width - windowBounds.width)),
          y: Math.floor(screenBounds.height - (windowBounds.height - screenBounds.y)),
        };
        break;
      case 'topCenter':
        pos = {
          x: Math.floor(screenBounds.x + ((screenBounds.width / 2) - (windowBounds.width / 2))),
          y: screenBounds.y,
        };
        break;
      case 'bottomCenter':
        pos = {
          x: Math.floor(screenBounds.x + ((screenBounds.width / 2) - (windowBounds.width / 2))),
          y: Math.floor(screenBounds.height - (windowBounds.height - screenBounds.y)),
        };
        break;
      case 'leftCenter':
        pos = {
          x: screenBounds.x,
          y: screenBounds.y + Math.floor(screenBounds.height / 2) - Math.floor(windowBounds.height / 2),
        };
        break;
      case 'rightCenter':
        pos = {
          x: Math.floor(screenBounds.x + (screenBounds.width - windowBounds.width)),
          y: screenBounds.y + Math.floor(screenBounds.height / 2) - Math.floor(windowBounds.height / 2),
        };
        break;
      default:
        pos = {
          x: Math.floor(screenBounds.x + ((screenBounds.width / 2) - (windowBounds.width / 2))),
          y: Math.floor(((screenBounds.height + screenBounds.y) / 2) - (windowBounds.height / 2)),
        };
    }

    return this._marginAdjust(pos, windowBounds, screenBounds);
  }

  /**
 * calculate window position according to saved x-y coords (with margin in mind)
 * @param {string} position - {x, y}
 * @return {object} final coordinates of window: {x, y}
 */
  _getCoordsXY(position) {
    const activeScreen = this._getScreen(position);
    const screenBounds = activeScreen.workArea;
    const windowBounds = this.browserWindow.getBounds();

    return this._marginAdjust(position, windowBounds, screenBounds);
  }

  /**
   * adjusts window position with margin in mind
   * @param {object} coords - coords of top-left corner of window
   * @param {object} windowBounds - window bounds
   * @param {object} screenBounds - screen bounds
   * @return {object} final coordinates of window: {x:_, y:_}
   */
  _marginAdjust(coords, windowBounds, screenBounds) {
    if (coords.x < (screenBounds.x + this.margin)) {
      coords.x = screenBounds.x + this.margin;
    }
    if (coords.y < (screenBounds.y + this.margin)) {
      coords.y = screenBounds.y + this.margin;
    }
    if (coords.x + windowBounds.width > (screenBounds.x + screenBounds.width - this.margin)) {
      coords.x = screenBounds.x + screenBounds.width - this.margin - windowBounds.width;
    }
    if (coords.y + windowBounds.height > (screenBounds.y + screenBounds.height - this.margin)) {
      coords.y = screenBounds.y + screenBounds.height - this.margin - windowBounds.height;
    }

    return coords;
  }

  /**
   * adjusts window position if position is 'tray'
   * @param {object} activeScreen - active screen
   * @param {object} windowBounds - window bounds
   * @return {object} final coordinates of window: {x:_, y:_}
   */
  _trayCoords(activeScreen, windowBounds) {
    const workArea = activeScreen.workArea;
    const screenBounds = activeScreen.bounds;
    const trayIconBounds = this._getTrayBounds();

    // TASKBAR LEFT
    if (workArea.x > 0) {
      return {
        x: workArea.x,
        y: workArea.height - windowBounds.height,
      };
    }

    // TASKBAR TOP
    if (workArea.y > 0) {
      return {
        x: Math.round(trayIconBounds.x + (trayIconBounds.width / 2) - (windowBounds.width / 2)),
        y: workArea.y,
      };
    }

    // TASKBAR RIGHT
    if (workArea.width < screenBounds.width) {
      return {
        x: workArea.width - windowBounds.width,
        y: screenBounds.height - windowBounds.height,
      };
    }

    // TASKBAR BOTTOM
    return {
      x: Math.round(trayIconBounds.x + (trayIconBounds.width / 2) - (windowBounds.width / 2)),
      y: workArea.height - windowBounds.height,
    };
  }

  /**
   * get position and size of icon in tray
   * @return {object} icon in tray: {x:_, y:_, width:_, height:_}
   */
  _getTrayBounds() {
    if (IS_LINUX) { // pretend tray on linux is top right
      const scr = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;

      return {
        width: 0,
        height: 0,
        x: scr.x + scr.width,
        y: 0,
      };
    }

    return TrayManager.getBounds(); // macOS and Windows only
  }

  /**
   * get screen to display window on
   * @param {string} position - text representation of position
   * @return {object} screen
   */
  _getScreen(position) {
    if (position === 'tray') {
      return screen.getDisplayMatching(this._getTrayBounds());
    } else {
      return screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    }
  }

  /**
   * get screen and re-calculated coords on it
   * @param {string} position - {x, y}
   * @return {object} {x, y, id}
   */
  getCoordsAndScreen(position) {
    const display = screen.getDisplayNearestPoint(position);

    console.log('saving screen: ', display.workArea);

    return {
      x: position.x - display.workArea.x,
      y: position.y - display.workArea.y,
      id: display.id,
    };
  }

  /**
   * get screen based on nearest point
   * @param {string} position - {x, y}
   * @return {object} screen
   */
  getScreenXY(position) {
    return screen.getDisplayNearestPoint(position);
  }

  /**
   * true if window is on specific display
   * @param {object} display - display in question
   * @return {boolean}
   */
  isOnScreen(display) {
    if (display.id === screen.getDisplayMatching(this.browserWindow.getBounds()).id) { //! проверять положение руками
      return true;
    }

    return false;
  }
};