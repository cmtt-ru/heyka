<template>
  <popover>
    <div class="buttons">
      <router-link
        v-if="permissions['workspaces.manage']"
        :to="{name: 'invite'}"
      >
        <ui-button
          :type="11"
          icon="add"
          data-popover-close
        >
          {{ texts.invite }}
        </ui-button>
      </router-link>

      <ui-button
        v-if="permissions['workspaces.manage']"
        :type="11"
        icon="edit"
        data-popover-close
        @click="openManageWorkspace"
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
        data-popover-close
        @click="workspaceClickHandler(workspace.id)"
      >
        <avatar
          class="workspace-avatar"
          :user-id="workspace.id"
          :image="userAvatar(workspace, 14)"
          :size="14"
          :border-radius="2"
        />

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
        data-popover-close
        @click="openWorkspaceCreation"
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
        >
          {{ texts.settings }}
        </ui-button>
      </router-link>
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
import Avatar from '@components/Avatar';
import Popover from '@components/Popover';
import UiButton from '@components/UiButton';
import { ipcRenderer } from 'electron';
import { mapGetters } from 'vuex';
import { getUserAvatarUrl } from '@libs/image';

export default {
  components: {
    Popover,
    UiButton,
    Avatar,
  },

  props: {
    /**
     * Permissions object
     */
    permissions: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      IS_DEV,
    };
  },

  computed: {
    ...mapGetters({
      workspaces: 'workspaces/getWorkspaces',
      selectedWorkspaceId: 'me/getSelectedWorkspaceId',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('popover.workspace');
    },

  },

  methods: {
    /**
     * Quit app handler
     * @returns {void}
     */
    quitAppHandler() {
      ipcRenderer.send('remote-quit');
    },

    /**
     * Open manage workspace
     * @returns {void}
     */
    async openManageWorkspace() {
      const { code } = await this.$API.auth.link();
      // const baseUrl = IS_DEV ? process.env.VUE_APP_DEV_URL : process.env.VUE_APP_PROD_URL;
      const baseUrl = 'http://localhost:8082/';
      const link = `${baseUrl}/manage/${code}`;

      window.open(link);
    },

    /**
     * Open workspace creation
     * @returns {void}
     */
    async openWorkspaceCreation() {
      const { code } = await this.$API.auth.link();
      // const baseUrl = IS_DEV ? process.env.VUE_APP_DEV_URL : process.env.VUE_APP_PROD_URL;
      const baseUrl = 'http://localhost:8082';
      const link = `${baseUrl}/workspace/create/${code}`;

      console.log(link);
      window.open(link);
    },

    workspaceClickHandler(workspaceId) {
      this.$store.dispatch('changeWorkspace', workspaceId);
    },

    userAvatar: getUserAvatarUrl,
  },
};
</script>

<style lang="stylus">
  .workspace-avatar
    margin-right 7px

  .workspace--checked
    color var(--color-1)
    margin-left auto
</style>
