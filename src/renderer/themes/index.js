import Vue from 'vue';
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
 * @param {string} name name of first theme
 * @returns {null} nothing
 */
  constructor(name) {
    this.storeVue = new Vue({
      data: () => ({
        themeArray: [],
        currentTheme: '',
        auto: false,
      }),
    });
    this.storeVue.themeArray = themes;
    this.storeVue.auto = ThemeFileStore.get('autoTheme', false);

    const theme = ThemeFileStore.get('currentTheme');

    if (!theme) {
      this.manualSetTheme(name);
    } else {
      this.__setTheme(theme);
      this.storeVue.currentTheme = theme;
    }

    nativeTheme.on('updated', () => {
      if (this.storeVue.auto) {
        this.autoSetTheme();
      }
    });
  }

  /**
   * Set theme depending on user's system preference
   * @returns {void}
   */
  autoSetTheme() {
    this.storeVue.auto = true;
    ThemeFileStore.set('autoTheme', true);
    if (nativeTheme.shouldUseDarkColors) {
      this.__setTheme('dark');
    } else {
      this.__setTheme('light');
    }
  }

  /**
   * Set theme manually by name
   * @param {string} name theme's name
   * @returns {void}
   */
  manualSetTheme(name) {
    this.storeVue.auto = false;
    ThemeFileStore.set('autoTheme', false);
    this.__setTheme(name);
  }

  /**
 * Switch theme to selected
 * @param {string} name name of theme
 * @returns {boolean} found or not found theme
 */
  __setTheme(name) {
    ThemeFileStore.set('currentTheme', name);
    this.storeVue.currentTheme = name;

    if (Object.prototype.hasOwnProperty.call(this.storeVue.themeArray, name)) {
      for (const prop in this.storeVue.themeArray[name].colors['root']) { // задаём глобальные переменные css
        document.documentElement.style.setProperty(prop, this.storeVue.themeArray[name].colors['root'][prop]);
      }

      return true;
    } else {
      return false;
    }
  }

  /**
 * Get StyleSheet for specific layout area
 * @param {string} area name of area (navbar/content/popover/etc.)
 * @returns {object}
 */
  getColors(area) {
    return this.storeVue.themeArray[this.storeVue.currentTheme].colors[area] || {};
  }

  /**
 * Get all app themes
 * @returns {array} all themes
 */
  getThemes() {
    return this.storeVue.themeArray;
  }

  /**
   * Get current theme name
   * @returns {string} theme name
   */
  getCurrentTheme() {
    return this.storeVue.currentTheme;
  }

  /**
   * Get current theme name
   * @returns {string} theme name
   */
  getCurrentAuto() {
    return this.storeVue.auto;
  }
}

export default new Themes('light');
