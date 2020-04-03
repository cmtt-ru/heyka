const state = () => {
  return {
    /**
     * App name
     * @used on about page
     * @type {string}
     */
    appName: 'Heyka Desktop',

    /**
     * App version
     * @used on about page
     * @type {string}
     */
    appVersion: '1.1.4',

    /**
     * App language
     * @type {string}
     */
    language: 'en',

    /**
     * Run app from tray or dock
     * `tray` | `dock`
     * @type {string}
     */
    runAppFrom: 'tray',

    /**
     * App autorun
     * @type {boolean}
     */
    autorun: true,

    /**
     * App color theme
     * @type {{auto: boolean, name: string}}
     */
    theme: {
      name: 'Dark',
      auto: true,
    },

    /**
     * List of user device
     * @type {{speakers: array, microphones: array, webcams: array}}
     */
    devices: {
      speakers: [],
      microphones: [],
      webcams: [],
    },

    /**
     * Whether to collect analytics
     * @type {boolean}
     */
    collectAnalytics: true,
  };
};

export default state();
