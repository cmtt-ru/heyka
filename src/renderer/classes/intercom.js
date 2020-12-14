/* eslint-disable camelcase */
let intercomInited = false;

class Intercom {
  constructor() {
    this.init();
  }

  init() {
    if (intercomInited) {
      return;
    }

    window.intercomSettings = {
      app_id: 'zmdddvb6',
      horizontal_padding: 10,
      vertical_padding: 10,
    };

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

          s.type = 'text/javascript'; s.async = true; s.src = 'https://widget.intercom.io/widget/zmdddvb6'; var x = d.getElementsByTagName('script')[0];

          x.parentNode.insertBefore(s, x);
        };

        if (document.readyState === 'complete') {
          l();
        } else {
          if (w.attachEvent) {
            w.attachEvent('onload', l);
          } else {
            w.addEventListener('load', l, false);
          }
        }
      }
    })();

    intercomInited = true;
  }

  setUserData(data) {
    window.Intercom('update', data);
  }

  show() {
    // window.Intercom('show');
  }

  hide() {

  }
}

export default new Intercom();
