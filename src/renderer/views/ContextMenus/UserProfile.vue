<template>
  <popover>
    <div class="buttons">
      <router-link :to="{ name: 'user', params: { id: myId }}">
        <ui-button
          data-popover-close
          :type="11"
          icon="user"
        >
          {{ texts.profile }}
        </ui-button>
      </router-link>

      <div class="delimiter" />

      <ui-button
        data-popover-close
        :type="11"
        icon="user-online"
        @click="changeStatus('online')"
      >
        {{ texts.online }}
      </ui-button>

      <ui-button
        data-popover-close
        :type="11"
        icon="user-idle"
        @click="changeStatus('idle')"
      >
        {{ texts.idle }}
      </ui-button>

      <ui-button
        data-popover-close
        :type="11"
        icon="user-offline"
        @click="changeStatus('offline')"
      >
        {{ texts.offline }}
      </ui-button>
    </div>
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import UiButton from '@components/UiButton';

export default {
  components: {
    Popover,
    UiButton,
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('popover.userProfile');
    },

    /**
     * User id
     * @returns {string}
     */
    myId() {
      return this.$store.getters['me/getMyId'];
    },
  },

  methods: {
    /**
     * Change user online status
     * @param {string} status – online status
     * @returns {void}
     */
    changeStatus(status) {
      this.$store.dispatch('me/setOnlineStatus', status);
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
