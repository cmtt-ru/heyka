/* eslint-disable camelcase */
let intercomInited = false;

const APP_ID = 'zmdddvb6';

const DEFAULT_INTERCOM_OPTIONS = {
  app_id: APP_ID,
  action_color: '#1575F1',
  hide_default_launcher: true,
};

/**
 * Itercom widget class
 */
class Intercom {
  /**
   * Initialize Intercome Widget once
   * @returns {void}
   */
  init() {
    if (intercomInited) {
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

    intercomInited = true;
  }

  show() {
    this.init();
    window.Intercom('show');
  }

  hide() {
    window.Intercom('hide');
  }

  setUserData(data) {
    window.Intercom('update', data);
  }

  destroy() {
    window.Intercom('shutdown');
  }
}

export default new Intercom();
