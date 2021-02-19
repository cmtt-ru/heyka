<template>
  <div>
    <div v-if="loading">
      {{ texts.webWait }}
    </div>
    <div v-else>
      <div v-if="!slackUsers.length">
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
        <div class="user-search__wrapper">
          <ui-input
            ref="top_slack_invite"
            v-model="filterKey"
            icon="search"
            placeholder="Search"
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
        <list
          ref="userList"
          class="user-list"
          selectable
          :filter-by="filterKey"
          @multipick="selectUser"
        >
          <list-item
            v-for="user in notInvitedSlackUsers"
            :key="user.id"
            :filter-key="user.name + user.realName"
            :selectable-content="user"
            button
            class="user"
          >
            <avatar
              class="user__avatar"
              :image="user.avatar32"
              :user-id="user.id"
              :size="32"
            />
            <div
              v-textfade
              class="user__inner"
            >
              <div
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
          class="submit-button-wrapper"
        >
          <ui-button
            :type="1"
            :disabled="!selectedUsers.length"
            @click="sendOneInvite"
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
import { mapGetters } from 'vuex';
import DeepLink from '@shared/DeepLink/DeepLinkRenderer';

export default {
  components: {
    UiButton,
    UiInput,
    List,
    ListItem,
    Avatar,
  },

  data() {
    return {
      loading: true,
      slackUsers: [],
      slackWorkspace: null,
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

    notInvitedSlackUsers() {
      return this.slackUsers.filter(el => !this.invitesSentTo.includes(el.id));
    },

  },

  async mounted() {
    DeepLink.on('slack-connect', ([status, error]) => {
      if (status === 'false') {
        this.$store.dispatch('app/addNotification', {
          data: {
            text: decodeURIComponent(error),
          },
        });
      } else {
        this.getSlackUsers();
      }
    });

    this.getSlackUsers();
  },

  beforeDestroy() {
    DeepLink.removeAllListeners('slack-connect');
  },

  methods: {

    async getSlackUsers() {
      try {
        const users = await this.$API.workspace.getSlackUsers(this.selectedWorkspaceId);

        this.slackUsers = users;
        this.slackWorkspace = this.getWorkspaceById(this.selectedWorkspaceId).slack;
      } catch (err) {
        console.log(err);
      }
      this.loading = false;
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

    async sendOneInvite() {
      try {
        for (const user of this.selectedUsers) {
          await this.$API.workspace.inviteSlackUser(this.selectedWorkspaceId, { slackUserId: user.id });
        }
        this.invitesSentTo = [...this.invitesSentTo, ...this.selectedUsers.map(el => el.id)];
        this.selectedUsers = [];
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
  background-color var(--new-bg-04)
  padding 6px 0 12px //! bottom is 20px while scrolled and 12px in idle, why
  position sticky
  top -0.5px
  z-index 10

/deep/ .input
  padding-left 54px

/deep/ .input__icon
  padding-left 10px

.select-all
  font-weight 500
  font-size 12px
  line-height 18px
  color var(--new-UI-01)
  cursor pointer
  margin 0 0 0 auto

  &--deselect
    color var(--new-signal-03)

  &__wrapper
    margin-bottom 12px
    width 100%
    display flex
    flex-direction row-reverse

.user-list
  margin-bottom 65px

.user
  padding 4px 10px
  display flex
  flex-direction row
  align-items center
  margin-bottom 2px
  border-radius 6px
  cursor pointer

  &:hover
    background-color var(--new-UI-06)

  &__check
    margin 0 5px
    padding 1px
    box-sizing border-box
    flex-shrink 0
    color var(--new-bg-04)
    border 1px solid var(--new-UI-05)
    border-radius 50%

  &.list-item--selected
    background-color initial

    &:hover
      background-color var(--new-UI-06)

    & .user__check
      background-color var(--new-UI-01)
      color var(--new-UI-09)
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
    font-size 13px
    line-height 16px

  &__name
    font-weight normal
    font-size 12px
    line-height 16px

.submit-button-wrapper
  position absolute
  bottom 0
  width 100%
  padding 16px
  background-color var(--new-bg-04)
  box-shadow inset -2px 0 0 1px var(--new-UI-06)
  transform translateX(-16px)

</style>
