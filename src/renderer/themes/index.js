import themes from './themes.json';
import fs from 'fs';
const { app } = require('electron').remote;

/**
 * A class that handles themes
 */
class Themes {
  /**
 * Inits first theme
 * @param {String} name name of first theme
 * @returns {null} nothing
 */
  constructor(name) {
    this.themeArray = themes;
    this.savedThemePath = app.getPath('appData') + '/heyka/savetheme.txt';

    try {
      const themeName = fs.readFileSync(this.savedThemePath, 'utf-8');

      this.switchTheme(themeName);
      console.log('found saved theme at: ' + this.savedThemePath);
    } catch (err) {
      console.log('no saved theme found');
      this.currentTheme = name;
      this.switchTheme(name);
    }
  }

  /**
 * Switch theme to selected
 * @param {String} name name of theme
 * @returns {boolean} found or not found theme
 */
  switchTheme(name) {
    fs.writeFileSync(this.savedThemePath, name);

    if (Object.prototype.hasOwnProperty.call(this.themeArray, name)) {
      for (const prop in this.themeArray[name].colors) { // задаём глобальные переменные css
        document.documentElement.style.setProperty('--' + prop, this.themeArray[name].colors[prop]);
      }

      return true;
    } else {
      return false;
    }
  }

  /**
 * Get all app themes
 * @returns {Array} all themes
 */
  getThemes() {
    return this.themeArray;
  }
}

export default new Themes('light');
