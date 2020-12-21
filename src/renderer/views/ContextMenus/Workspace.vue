<template>
  <popover>
    <div class="buttons">
      <router-link
        v-if="permissions['workspaces.manage']"
        :to="{name: 'invite'}"
      >
        <ui-button
          :type="11"
          icon="user-plus"
          data-popover-close
        >
          {{ texts.invite }}
        </ui-button>
      </router-link>

      <ui-button
        v-if="permissions['workspaces.manage']"
        :type="11"
        icon="manage"
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
          :image="userAvatar(workspace, 18)"
          :size="18"
          :border-radius="6"
        />

        {{ workspace.name }}

        <svg-icon
          v-if="workspace.id === selectedWorkspaceId"
          class="workspace--checked"
          name="check"
        />
      </ui-button>
    </div>

    <div class="delimiter" />

    <div class="buttons">
      <ui-button
        :type="11"
        icon="plus"
        data-popover-close
        @click="openWorkspaceCreation"
      >
        {{ texts.new }}
      </ui-button>
    </div>
  </popover>
</template>

<script>
import Avatar from '@components/Avatar';
import Popover from '@components/Popover';
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';
import { getUserAvatarUrl } from '@libs/image';
import { WEB_URL } from '@sdk/Constants';

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
     * Open manage workspace
     * @returns {void}
     */
    async openManageWorkspace() {
      const { code } = await this.$API.auth.link();
      const link = `${WEB_URL}/manage/${this.$store.state.me.selectedWorkspaceId}/${code}`;

      if (IS_DEV) {
        navigator.clipboard.writeText(link);
      }

      window.open(link);
    },

    /**
     * Open workspace creation
     * @returns {void}
     */
    async openWorkspaceCreation() {
      const { code } = await this.$API.auth.link();
      const link = `${WEB_URL}/ws/create/${code}`;

      window.open(link);
    },

    workspaceClickHandler(workspaceId) {
      this.$store.dispatch('changeWorkspace', workspaceId);
    },

    userAvatar: getUserAvatarUrl,
  },
};
</script>

<style lang="stylus" scoped>
  .workspace-avatar
    margin-right 8px

  .workspace--checked
    color var(--new-UI-01)
    margin-left auto
</style>
