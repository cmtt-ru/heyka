<template>
  <div>
    <div>
      <div v-if="slackWorkspace===null">
        <div class="top-info-text">
          {{ texts.noWorkspaces }}
        </div>
        <ui-button
          :type="17"
          :wide="true"
          class="link"
          icon="slack"
          size="large"
          @click="slackConnect"
        >
          {{ texts.connect }}
        </ui-button>
      </div>

      <div v-else>
        <div
          v-if="!invitesSentTo.length"
          class="top-info-text"
        >
          {{ $t('slackInvite.canInvite', [slackWorkspace.name]) }}
        </div>
        <div
          v-else
          class="top-info-text"
        >
          {{ texts.successInviteStart }}{{ $tc("slackInvite.successInviteMiddle", invitesSentTo.length) }}{{ texts.successInviteEnd }}
        </div>
        <div
          v-sticky.top="{ offset: -1, rootSelector: '.pseudo-popup__body' }"
          class="user-search__wrapper"
        >
          <ui-input
            v-model="filterKey"
            icon="search"
            :placeholder="$t('techTexts.search')"
            class="user-search"
          />
        </div>

        <div class="select-all__wrapper">
          <div
            v-if="!selectedUsers.length"
            class="select-all"
            @click="selectAllUsers"
          >
            {{ texts.selectAll }}
          </div>
          <div
            v-else
            class="select-all select-all--deselect"
            @click="deselectAllUsers"
          >
            {{ texts.deselectAll }}
          </div>
        </div>
        <placeholder
          v-if="loading"
          class="users-placeholder"
          avatar
          two-lines
          right-button
          :height="44"
          :gap="-2"
        />
        <list
          v-else
          ref="userList"
          v-model="filteredSlackUsers"
          class="user-list"
          selectable
          :filter-by="filterKey"
          :items="slackUsersForSearch"
          filter-key="searchBy"
          @multipick="selectUser"
        >
          <list-item
            v-for="user in filteredSlackUsers"
            :key="user.id"
            :similarity="user.similarity"
            :select-data="user"
            button
            class="user"
          >
            <avatar
              class="user__avatar"
              :user-id="user.id"
              :image="user.avatar72"
              :size="32"
            />
            <div
              v-textfade
              class="user__inner"
            >
              <div
                v-textfade
                class="user__real-name"
              >
                {{ user.realName }}
              </div>
              <div class="user__name">
                @{{ user.name }}
              </div>
            </div>
            <svg-icon
              class="user__check"
              name="check"
              width="16"
              height="16"
            />
          </list-item>
        </list>
        <div
          v-sticky.bottom="{ offset: 0, rootSelector: '.pseudo-popup__body' }"
          class="submit-button-wrapper"
        >
          <ui-button
            :type="1"
            :disabled="!selectedUsers.length"
            size="large"
            wide
            @click="sendInvites"
          >
            {{ $tc("slackInvite.inviteUsers", selectedUsers.length) }}
          </ui-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiInput } from '@components/Form';
import { List, ListItem } from '@components/List';
import Avatar from '@components/Avatar';
import Placeholder from '@components/Placeholder';

import { mapGetters } from 'vuex';
import DeepLink from '@shared/DeepLink/DeepLinkRenderer';
import notify from '@libs/notify';

export default {
  components: {
    UiButton,
    UiInput,
    List,
    ListItem,
    Avatar,
    Placeholder,
  },

  data() {
    return {
      loading: false,
      slackUsers: null,
      filteredSlackUsers: [],
      selectedUsers: [],
      filterKey: '',
      invitesSentTo: [],
    };
  },

  computed: {
    ...mapGetters({
      selectedWorkspaceId: 'me/getSelectedWorkspaceId',
      getWorkspaceById: 'workspaces/getWorkspaceById',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('slackInvite');
    },

    /**
     * Concatenta usernames and real names of slack users for better search
     * @returns {object}
     */
    slackUsersForSearch() {
      if (!this.slackUsers) {
        return [];
      }

      return this.slackUsers.map(user => {
        return {
          ...user,
          searchBy: user.realName + user.name,
        };
      }).filter(el => !this.invitesSentTo.includes(el.id));
    },

    slackWorkspace() {
      return this.getWorkspaceById(this.selectedWorkspaceId).slack || null;
    },

  },

  async mounted() {
    DeepLink.on('slack-connect', ([status, error]) => {
      if (status === 'false') {
        notify(decodeURIComponent(error), { icon: 'warning' });
      } else {
        this.getSlackUsers();
      }
    });

    if (this.slackWorkspace) {
      await this.getSlackUsers();
    }
  },

  beforeDestroy() {
    DeepLink.removeAllListeners('slack-connect');
  },

  methods: {

    async getSlackUsers() {
      try {
        this.loading = true;
        const users = await this.$API.workspace.getSlackUsers(this.selectedWorkspaceId);

        this.slackUsers = users;
      } catch (err) {
        console.log(err);
        if (err.response.data.message === 'SlackNotConnected') {
          await this.$store.dispatch('workspaces/updateList');
        }
        this.slackUsers = [];
      } finally {
        this.loading = false;
      }
    },

    async slackConnect() {
      const url = await this.$API.workspace.connectWithSlack(this.selectedWorkspaceId);

      window.open(url.redirect);
    },

    selectUser(data) {
      this.selectedUsers = data;
    },

    selectAllUsers() {
      this.$refs.userList.selectAll();
    },

    deselectAllUsers() {
      this.$refs.userList.deselectAll();
    },

    async sendInvites() {
      try {
        for (const user of this.selectedUsers) {
          await this.$API.workspace.inviteSlackUser(this.selectedWorkspaceId, { slackUserId: user.id });
        }
        this.invitesSentTo = [...this.invitesSentTo, ...this.selectedUsers.map(el => el.id)];
        this.selectedUsers = [];
        this.deselectAllUsers();
        document.getElementsByClassName('pseudo-popup__body')[0].scrollTo(0, 0);
      } catch (err) {
        console.error(err);
      }
    },

  },

};
</script>

<style lang="stylus" scoped>

.top-info-text
  margin 4px 0 16px

.user-search__wrapper
  background var(--Background-white)
  padding-bottom 12px
  z-index 1
  position relative

  &.ui-sticked:after
    content ''
    position absolute
    bottom -1px
    width calc(100% + 32px)
    height 1px
    left -16px
    background var(--UI-divider-1)

/deep/ .input
  padding-left 54px

/deep/ .input__icon
  padding-left 10px

.select-all
  font-weight 500
  font-size 12px
  line-height 18px
  color var(--UI-active)
  cursor pointer
  margin 0 0 0 auto

  &--deselect
    color var(--UI-error)

  &__wrapper
    margin-bottom 10px
    width 100%
    display flex
    flex-direction row-reverse

.users-placeholder
  margin-top -4px
  padding 0 14px 0 11px

.user
  padding 4px 10px
  display flex
  flex-direction row
  align-items center
  margin-bottom 4px
  border-radius 6px
  cursor pointer
  height 44px

  &:hover
    background var(--Background-darkgrey-hover)
  &:active
    background var(--Background-darkgrey-active)

  &__check
    margin 0 5px
    padding 1px
    box-sizing border-box
    flex-shrink 0
    color transparent
    border 1px solid var(--UI-divider-3)
    border-radius 50%

  &.list-item--selected
    background-color initial

    &:hover
      background var(--Background-darkgrey-hover)
    &:active
      background var(--Background-darkgrey-active)

    & .user__check
      background var(--UI-active)
      color var(--Text-white)
      padding 2px
      border none

  &__avatar
    margin-right 12px
    flex-shrink 0

  &__inner
    display flex
    flex-direction column
    align-items flex-start
    flex-grow 1

  &__real-name
    font-weight 500
    line-height 16px

  &__name
    font-weight normal
    font-size 12px
    line-height 16px
    margin-top 4px

.submit-button-wrapper
  width 100%
  box-sizing border-box
  padding 16px 0
  background var(--Background-white)
  box-shadow none
  position: relative

  &.ui-sticked:after
    content ''
    position absolute
    top 0
    width calc(100% + 32px)
    height 1px
    left -16px
    background var(--UI-divider-1)

</style>
