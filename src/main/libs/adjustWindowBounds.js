import { screen } from 'electron';

/**
 * Default edge margin
 * @type {number}
 */
const MARGIN = 20;

/**
 * Adjust window position
 *
 * @param {BrowserWindow} window – window
 * @param {number} margin – margins
 * @returns {void}
 */
export default function adjustBounds(window, margin = MARGIN) {
  const windowBounds = window.getBounds();
  const screenBounds = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;
  const app = {
    x: windowBounds.x,
    y: windowBounds.y,
  };

  /** Check left edge */
  if (app.x < (screenBounds.x + margin)) {
    app.x = screenBounds.x + margin;
  }

  /** Check top edge */
  if (app.y < (screenBounds.y + margin)) {
    app.y = screenBounds.y + margin;
  }

  /** Check right edge */
  if (app.x + windowBounds.width > (screenBounds.x + screenBounds.width - margin)) {
    app.x = screenBounds.x + screenBounds.width - margin - windowBounds.width;
  }

  /** Check bottom edge */
  if (app.y + windowBounds.height > (screenBounds.y + screenBounds.height - margin)) {
    app.y = screenBounds.y + screenBounds.height - margin - windowBounds.height;
  }

  window.setPosition(app.x, app.y);
}
