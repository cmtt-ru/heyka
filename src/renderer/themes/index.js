import themes from './themes.json';
import Store from 'electron-store';
const { nativeTheme } = require('electron').remote;
const ThemeFileStore = new Store({
  name: 'theme',
  encryptionKey: '31415926',
});

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

    if (nativeTheme.shouldUseDarkColors) {
      this.userHasDarkPreference();
    }

    const theme = ThemeFileStore.get('currentTheme');

    if (theme) {
      this.switchTheme(theme);
      this.currentTheme = theme;
    } else {
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
    ThemeFileStore.set('currentTheme', name);

    if (Object.prototype.hasOwnProperty.call(this.themeArray, name)) {
      for (const prop in this.themeArray[name].colors['root']) { // задаём глобальные переменные css
        document.documentElement.style.setProperty(prop, this.themeArray[name].colors['root'][prop]);
      }

      return true;
    } else {
      return false;
    }
  }

  /**
 * Get StyleSheet for specific layout area
 * @param {String} area name of area (navbar/content/popover/etc.)
 * @returns {Object}
 */
  getColors(area) {
    return this.themeArray[this.currentTheme].colors[area] || {};
  }

  /**
 * If no theme is saved, we should use dark theme
 * @returns {void}
 */
  userHasDarkPreference() {
    const theme = ThemeFileStore.get('currentTheme');

    if (!theme) {
      this.switchTheme('dark');
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
