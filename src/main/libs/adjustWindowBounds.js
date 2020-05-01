import { screen } from 'electron';

/**
 * Adjust window position
 *
 * @param {BrowserWindow} window – window
 * @param {number} margin – margins
 * @returns {void}
 */
export default function adjustBounds(window, margin = 0) {
  const windowBounds = window.getBounds();
  const screenBounds = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;
  const app = {
    x: window.getPosition()[0],
    y: window.getPosition()[1],
  };

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

  window.setPosition(app.x, app.y);
}
