<template>
  <popover :min-width="200">
    <div
      v-if="myWorkspace"
      class="buttons"
    >
      <router-link :to="{ name: 'user', params: { id: myId }}">
        <ui-button
          data-popover-close
          :type="11"
          icon="user"
        >
          {{ texts.profile }}
        </ui-button>
      </router-link>
    </div>

    <div
      v-if="myWorkspace"
      class="delimiter"
    />

    <div
      v-if="myWorkspace"
      class="buttons"
    >
      <ui-button
        data-popover-close
        :type="11"
        :class="{'status--checked': onlineStatus === 'online'}"
        @click="changeStatus('online')"
      >
        <svg-icon
          class="l-mr-8"
          name="user-online"
        />

        {{ texts.online }}

        <svg-icon
          v-if="onlineStatus === 'online'"
          class="status--checked"
          name="check"
        />
      </ui-button>

      <ui-button
        data-popover-close
        :type="11"
        :class="{'status--checked': onlineStatus === 'idle'}"
        @click="changeStatus('idle')"
      >
        <svg-icon
          class="l-mr-8"
          name="user-idle"
        />

        {{ texts.idle }}

        <svg-icon
          v-if="onlineStatus === 'idle'"
          class="status--checked"
          name="check"
        />
      </ui-button>

      <ui-button
        data-popover-close
        :type="11"
        :class="{'status--checked': onlineStatus === 'offline'}"
        @click="changeStatus('offline')"
      >
        <svg-icon
          class="l-mr-8"
          name="user-offline"
        />

        {{ texts.offline }}

        <svg-icon
          v-if="onlineStatus === 'offline'"
          class="status--checked"
          name="check"
        />
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
import { mapGetters, mapState } from 'vuex';

export default {
  components: {
    Popover,
    UiButton,
  },

  computed: {
    ...mapGetters({
      myId: 'me/getMyId',
      myWorkspace: 'myWorkspace',
    }),

    ...mapState('me', {
      onlineStatus: 'onlineStatus',
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
      window.ipcRenderer.send('remote-quit');
    },
  },
};
</script>

<style lang="stylus" scoped>
  .quit-button
    color var(--UI-error)

    &:hover
      background var(--UI-error-secondary)

    /deep/ svg
      color var(--UI-error)

  .status--checked
    color var(--UI-active)

    &.icon
      margin-left auto
</style>
