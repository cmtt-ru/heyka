/* eslint-disable no-magic-numbers */
/* eslint-disable require-jsdoc */
'use strict';

import { screen } from 'electron';
import TrayManager from '../../main/classes/TrayManager';

const isLinux = process.platform === 'linux';

export default class Positioner {
  constructor(browserWindow, margin = 20) {
    this.browserWindow = browserWindow;
    this.margin = margin;
  }

  _getCoords(position) {
    const activeScreen = this._getScreen(position);
    const screenBounds = activeScreen.workArea;
    const windowBounds = this._getWindowBounds();

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

  _marginAdjust(app, windowBounds, screenBounds, margin = this.margin) {
    if (app.x < (screenBounds.x + margin)) {
      app.x = screenBounds.x + margin;
    }
    if (app.y < (screenBounds.y + margin)) {
      app.y = screenBounds.y + margin;
    }
    if (app.x + windowBounds.width > (screenBounds.x + screenBounds.width - margin)) {
      app.x = screenBounds.x + screenBounds.width - margin - windowBounds.width;
    }
    if (app.y + windowBounds.height > (screenBounds.y + screenBounds.height - margin)) {
      app.y = screenBounds.y + screenBounds.height - margin - windowBounds.height;
    }

    return app;
  }

  _trayCoords(activeScreen, windowBounds, trayIconBounds = this._getTrayBounds()) {
    const workArea = activeScreen.workArea;
    const screenBounds = activeScreen.bounds;

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

  _getWindowBounds() {
    return this.browserWindow.getBounds();
  }

  _getTrayBounds() {
    if (isLinux) { // pretend tray on linux is bottom right
      const scr = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;

      return {
        width: 0,
        height: 0,
        x: scr.x + scr.width,
        y: scr.y + scr.height,
      };
    }

    return TrayManager.getBounds(); // macOS and Windows only
  }

  _getScreen(iftray) {
    if (iftray === 'tray') {
      return screen.getDisplayMatching(this._getTrayBounds());
    } else {
      return screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    }
  }

  move(position) {
    const coords = this._getCoords(position);

    this.browserWindow.setPosition(coords.x, coords.y);
  }

  calculate(position) {
    const coords = this._getCoords(position);

    return {
      x: coords.x,
      y: coords.y,
    };
  }
};