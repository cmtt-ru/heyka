<template>
  <popover>
    <div class="buttons">
      <ui-button
        :type="11"
        icon="add"
        @click="_notImplemented()"
      >
        {{ texts.invite }}
      </ui-button>
      <ui-button
        :type="11"
        icon="edit"
        @click="_notImplemented()"
      >
        {{ texts.manage }}
      </ui-button>
    </div>

    <div class="delimiter" />

    <div class="buttons">
      <ui-button
        v-for="workspace in workspaces"
        :key="workspace.id"
        :type="11"
      >
        <img
          class="workspace-avatar"
          :src="workspace.avatar"
        >
        {{ workspace.name }}

        <svg-icon
          v-if="workspace.id === selectedWorkspaceId"
          class="workspace--checked"
          name="check"
        />
      </ui-button>

      <ui-button
        :type="11"
        icon="workspace"
        @click="_notImplemented()"
      >
        {{ texts.new }}
      </ui-button>
    </div>

    <div class="delimiter" />

    <div class="buttons">
      <router-link :to="{name: 'settings'}">
        <ui-button
          :type="11"
          icon="settings"
          propagation
        >
          {{ texts.settings }}
        </ui-button>
      </router-link>
      <ui-button
        v-if="notProd"
        :type="11"
        icon="disconnect"
        @click.native="logoutHandler"
      >
        Logout
      </ui-button>
      <ui-button
        :type="11"
        icon="disconnect"
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
import electron from 'electron';
import logout from '@api/auth/logout';

export default {
  components: {
    Popover,
    UiButton,
  },

  props: {

  },

  computed: {
    /**
     * List of available workspaces
     * @returns {Array<Workspace>}
     */
    workspaces() {
      return this.$store.getters['workspaces/getWorkspaces'];
    },

    /**
     * Selected workspace id
     * @returns {string}
     */
    selectedWorkspaceId() {
      return this.$store.getters['me/getSelectedWorkspaceId'];
    },

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('popover.workspace');
    },

    /**
     * check if we are not in prod
     * @returns {boolean}
     */
    notProd() {
      return process.env.NODE_ENV !== 'production';
    },
  },

  mounted() {

  },

  methods: {
    /**
     * Quit app handler
     * @returns {void}
     */
    quitAppHandler() {
      electron.remote.app.quit();
    },

    /**
     * Logout handler
     * @returns {void}
     */
    logoutHandler() {
      logout();
    },
  },
};
</script>

<style lang="stylus">
  .workspace-avatar
    width 14px
    height 14px
    border-radius 2px
    margin-right 7px
    outline solid 1px var(--shadow-10)
    outline-offset: -1px;

  .workspace--checked
    color var(--color-1)
    margin-left auto
</style>
