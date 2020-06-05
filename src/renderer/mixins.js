import i18n from '@/i18n';
import broadcastActions from '@classes/broadcastActions';

export const Mixin = {

  computed: {
    /**
     * Get needed text from I18n-locale file
     * @returns {string}
     */
    text() {
      return i18n.t('notifications.notImplemented');
    },
  },

  methods: {
    _notImplemented: function () {
      const notification = {
        lifespan: 5000,
        data: {
          text: this.text,
        },
      };

      broadcastActions.dispatch('app/addNotification', notification);
    },
  },
};