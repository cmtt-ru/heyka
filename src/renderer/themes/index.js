import Vue from 'vue';
import themes from './themes.json';
import { ipcRenderer } from 'electron';
import vuex from '@/store';
import { heykaStore } from '@/store/localStore';

/**
 * A class that handles themes
 */
class Themes {
  /**
 * Inits first theme
 * @returns {void}
 */
  constructor() {
    /* Vue for data reactivity */
    this.storeVue = new Vue({
      data: () => ({
        themeArray: [],
        currentTheme: '',
        auto: false,
      }),
    });
    this.storeVue.themeArray = themes;

    /* Get current theme and auto mode from local store */
    const theme = heykaStore.get('theme', {
      name: 'light',
      auto: true,
    });

    this.storeVue.auto = theme.auto;
    this.storeVue.currentTheme = theme.name;

    if (theme.auto) {
      this.autoSetTheme();
    } else {
      this.manualSetTheme(theme.name);
    }

    /* Listen to native theme update (in case we have automode on) */
    ipcRenderer.on('native-theme-updated', () => {
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
    if (ipcRenderer.sendSync('remote-shouldUseDarkColors')) {
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
    this.__setTheme(name);
  }

  /**
 * Switch theme to selected
 * @param {string} name name of theme
 * @returns {boolean} found or not found theme
 */
  __setTheme(name) {
    this.storeVue.currentTheme = name;
    heykaStore.set('theme', {
      name: this.storeVue.currentTheme,
      auto: this.storeVue.auto,
    });
    vuex.commit('app/SET_THEME', {
      name: this.storeVue.currentTheme,
      auto: this.storeVue.auto,
    });
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
    if (this.storeVue.currentTheme) {
      return this.storeVue.themeArray[this.storeVue.currentTheme].colors[area];
    }

    return {};
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
   * @returns {string}
   */
  getCurrentTheme() {
    return this.storeVue.currentTheme;
  }

  /**
   * Get theme's automode state
   * @returns {boolean}
   */
  getCurrentAuto() {
    return this.storeVue.auto;
  }
}

export default new Themes();
