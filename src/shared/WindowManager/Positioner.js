'use strict';

import { screen } from 'electron';
import TrayManager from '../../main/classes/TrayManager';
import { IS_LINUX } from '../../sdk/Constants';

const DEFAULT_MARGIN = 20;

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

    // Positions
    const positions = {
      tray: this._trayCoords(activeScreen, windowBounds),
      topLeft: {
        x: screenBounds.x,
        y: screenBounds.y,
      },
      topRight: {
        x: Math.floor(screenBounds.x + (screenBounds.width - windowBounds.width)),
        y: screenBounds.y,
      },
      bottomLeft: {
        x: screenBounds.x,
        y: Math.floor(screenBounds.height - (windowBounds.height - screenBounds.y)),
      },
      bottomRight: {
        x: Math.floor(screenBounds.x + (screenBounds.width - windowBounds.width)),
        y: Math.floor(screenBounds.height - (windowBounds.height - screenBounds.y)),
      },
      topCenter: {
        x: Math.floor(screenBounds.x + ((screenBounds.width / 2) - (windowBounds.width / 2))),
        y: screenBounds.y,
      },
      bottomCenter: {
        x: Math.floor(screenBounds.x + ((screenBounds.width / 2) - (windowBounds.width / 2))),
        y: Math.floor(screenBounds.height - (windowBounds.height - screenBounds.y)),
      },
      leftCenter: {
        x: screenBounds.x,
        y: screenBounds.y + Math.floor(screenBounds.height / 2) - Math.floor(windowBounds.height / 2),
      },
      rightCenter: {
        x: Math.floor(screenBounds.x + (screenBounds.width - windowBounds.width)),
        y: screenBounds.y + Math.floor(screenBounds.height / 2) - Math.floor(windowBounds.height / 2),
      },
      center: {
        x: Math.floor(screenBounds.x + ((screenBounds.width / 2) - (windowBounds.width / 2))),
        y: Math.floor(((screenBounds.height + screenBounds.y) / 2) - (windowBounds.height / 2)),
      },
    };

    return this._marginAdjust(positions[position], windowBounds, screenBounds);
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
};