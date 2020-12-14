/* eslint-disable camelcase */
const APP_ID = 'zmdddvb6';

const DEFAULT_INTERCOM_OPTIONS = {
  app_id: APP_ID,
  action_color: '#1575F1',
  hide_default_launcher: true,
};

/**
 * Intercom widget class
 */
class Intercom {
  /**
   * Intercom constructor
   */
  constructor() {
    this.intercomInited = false;
  }

  /**
   * Initialize Intercom Widget once
   * @returns {void}
   */
  init() {
    if (this.intercomInited) {
      return;
    }

    (function () {
      var w = window; var ic = w.Intercom;

      if (typeof ic === 'function') {
        ic('reattach_activator'); ic('update', w.intercomSettings);
      } else {
        var d = document; var i = function () {
          i.c(arguments);
        };

        i.q = []; i.c = function (args) {
          i.q.push(args);
        }; w.Intercom = i; var l = function () {
          var s = d.createElement('script');

          s.type = 'text/javascript'; s.async = true; s.src = 'https://widget.intercom.io/widget/' + APP_ID; var x = d.getElementsByTagName('script')[0];

          x.parentNode.insertBefore(s, x);
        };

        if (document.readyState === 'complete') {
          l();
        } else if (w.attachEvent) {
          w.attachEvent('onload', l);
        } else {
          w.addEventListener('load', l, false);
        }
      }
    })();

    window.Intercom('boot', DEFAULT_INTERCOM_OPTIONS);

    this.intercomInited = true;
  }

  /**
   * Init & Show widget
   * @returns {void}
   */
  show() {
    window.Intercom('show');
  }

  /**
   * Hide widget
   * @returns {void}
   */
  hide() {
    window.Intercom('hide');
  }

  /**
   * Set user data, like name or email
   * @param {object} data – user data
   * @returns {void}
   */
  setUserData(data) {
    window.Intercom('update', data);
  }

  /**
   * Destroy widget
   * @returns {void}
   */
  destroy() {
    window.Intercom('shutdown');
  }
}

export default new Intercom();
