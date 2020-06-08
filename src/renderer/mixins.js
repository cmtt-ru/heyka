import i18n from '@/i18n';
import broadcastActions from '@classes/broadcastActions';

export const Mixin = {

  computed: {
    /**
     * Get needed text from I18n-locale file
     * @returns {string}
     */
    __notImplementedText() {
      return i18n.t('notifications.notImplemented');
    },
  },

  methods: {
    /**
     * Show "feature not implemented" notification
     * @returns {string}
     */
    _notImplemented: function () {
      const notification = {
        lifespan: 5000,
        data: {
          text: this.__notImplementedText,
        },
      };

      broadcastActions.dispatch('app/addNotification', notification);
    },
  },
};