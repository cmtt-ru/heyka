import themes from './themes.json';

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
    this.currentTheme = name;
    this.switchTheme(name);
  }

  /**
 * Switch theme to selected
 * @param {String} name name of theme
 * @returns {boolean} found or not found theme
 */
  switchTheme(name) {
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
