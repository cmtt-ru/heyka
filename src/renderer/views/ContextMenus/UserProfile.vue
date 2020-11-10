<template>
  <popover :min-width="200">
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

      <router-link :to="{name: 'settings'}">
        <ui-button
          :type="11"
          icon="settings"
        >
          {{ texts.settings }}
        </ui-button>
      </router-link>
    </div>

    <div class="delimiter" />

    <div class="buttons">
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

    <div class="delimiter" />

    <div class="buttons">
      <ui-button
        :type="11"
        icon="disconnect"
        @click="logoutHandler"
      >
        Logout
      </ui-button>

      <ui-button
        :type="11"
        icon="quit"
        class="quit-button"
        @click.native="quitAppHandler"
      >
        {{ texts.quit }}
      </ui-button>
    </div>
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import UiButton from '@components/UiButton';
import logout from '@api/auth/logout';
import { mapGetters } from 'vuex';
import { ipcRenderer } from 'electron';

export default {
  components: {
    Popover,
    UiButton,
  },

  computed: {
    ...mapGetters({
      myId: 'me/getMyId',
    }),
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('popover.userProfile');
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

    /**
     * Logout handler
     * @returns {void}
    */
    logoutHandler() {
      logout();
    },

    /**
     * Quit app handler
     * @returns {void}
     */
    quitAppHandler() {
      ipcRenderer.send('remote-quit');
    },
  },
};
</script>

<style lang="stylus" scoped>
  .quit-button
    color var(--new-signal-03)

    &:hover
      background var(--new-signal-03-3)

    /deep/ svg
      color var(--new-signal-03)
</style>
