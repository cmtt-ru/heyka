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
    this.colorarray = themes;
    this.currentTheme = name;
    this.switchColors(name);
  }

  /**
 * Loads language files
 * @param {String} name name of theme
 * @returns {Array} all translation sheets
 */
  switchColors(name) {
    if (Object.prototype.hasOwnProperty.call(themes, name)) {
      for (const prop in themes[name].colors) { // задаём глобальные переменные css
        document.documentElement.style.setProperty('--' + prop, themes[name].colors[prop]);
      }
    } else {
      return 'theme not found';
    }
  }
}

export default new Themes('light');