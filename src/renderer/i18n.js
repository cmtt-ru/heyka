/* eslint no-magic-numbers: 0 */
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { remote } from 'electron';
import Store from 'electron-store';

const heykaStore = new Store({
  name: 'app',
});

Vue.use(VueI18n);

/**
 * Loads language files
 * @returns {array} all translation sheets
 */
function loadLocaleMessages() {
  const locales = require.context('./translations', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};

  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);

    if (matched && matched.length > 1) {
      const locale = matched[1];

      messages[locale] = locales(key);
    }
  });

  return messages;
}

export default new VueI18n({
  locale: heykaStore.get('language') || remote.app.getLocale() || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages(),
});

const defaultPluralization = VueI18n.prototype.getChoiceIndex;

/**
 * Custom pluralization method for russian locale
 *
 * @param {number} choice - a choice index given by the input to $tc: `$tc('path.to.rule', choiceIndex)`
 * @param {number} choicesLength - an overall amount of available choices
 * @returns {number} index -  a final choice index to select plural word by
 */
VueI18n.prototype.getChoiceIndex = function (choice, choicesLength) {
  if (this.locale !== 'ru') {
    return defaultPluralization.call(this, choice, choicesLength);
  }

  if (choice === 0) {
    return 0;
  }

  const teen = choice > 10 && choice < 20;
  const endsWithOne = choice % 10 === 1;

  if (!teen && endsWithOne) {
    return 1;
  }

  if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
    return 2;
  }

  return (choicesLength < 4) ? 2 : 3;
};
