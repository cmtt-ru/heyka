<template>
  <pseudo-popup
    :header-has-shadow="false"
    cancel-text
    @close="closeHandler"
  >
    <template #header>
      {{ texts.header }}
    </template>

    <template #body>
      <tabs v-model="selectedTab">
        <tab
          selected
          :name="texts.userTab"
        >
          <div
            v-sticky.top="{ offset: -0.1, rootSelector: '.pseudo-popup__body' }"
            class="user-search__wrapper"
          >
            <ui-input
              v-model="filterKey"
              icon="search"
              :placeholder="$t('techTexts.search')"
              class="user-search"
            />
          </div>

          <list
            v-model="filteredGroups"
            class="user-list"
            selectable
            :filter-by="filterKey"
            :items="groups"
            filter-key="name"
            no-empty-text
            @multipick="selectGroup"
          >
            <list-item
              v-for="group in filteredGroups"
              :key="group.id"
              :similarity="group.similarity"
              :select-data="group"
              button
              class="user"
            >
              <div class="user__avatar user__avatar--group">
                <svg-icon
                  name="group"
                  :width="18"
                  :height="18"
                />
              </div>
              <div
                v-textfade
                class="user__inner"
              >
                <div
                  class="user__real-name"
                >
                  {{ group.name }}
                </div>
                <div
                  class="user__channel"
                >
                  <div>{{ $tc('manage.membersAmount', group.membersCount) }}</div>
                </div>
              </div>
              <svg-icon
                class="user__check"
                name="check"
                width="15"
                height="15"
              />
            </list-item>
          </list>

          <list
            v-model="filteredWorkspaceUsers"
            class="user-list"
            selectable
            :filter-by="filterKey"
            :items="workspaceUsers"
            filter-key="name"
            :no-empty-text="filteredGroups[0] && filteredGroups[0].similarity !== Infinity"
            @multipick="selectUser"
          >
            <list-item
              v-for="user in filteredWorkspaceUsers"
              :key="user.id"
              :similarity="user.similarity"
              :select-data="user"
              :class="{'user--offline': isUserOffline(user) || isUserInSameChannel(user) }"
              button
              class="user"
            >
              <avatar
                class="user__avatar"
                :user-id="user.id"
                :status="user.onlineStatus !== 'online'"
                :size="32"
              />
              <div
                v-textfade
                class="user__inner"
              >
                <div
                  class="user__real-name"
                >
                  {{ user.name }}
                </div>
                <div
                  v-if="userChannelName(user.id) && !isUserInSameChannel(user)"
                  class="user__channel"
                >
                  <svg-icon
                    class="user__channel__icon"
                    name="channel"
                    size="small"
                  />
                  <div>{{ userChannelName(user.id).name }}</div>
                </div>
                <div
                  v-if="isUserOffline(user) && !userChannelName(user.id)"
                  class="user__channel"
                >
                  {{ $t('techTexts.offline') }}
                </div>
                <div
                  v-if="isUserInSameChannel(user)"
                  class="user__channel"
                >
                  {{ texts.userInSameChannel }}
                </div>
              </div>
              <svg-icon
                class="user__check"
                name="check"
                width="15"
                height="15"
              />
            </list-item>
          </list>
        </tab>

        <tab :name="texts.guestTab">
          <div v-show="!hasLink">
            <div class="top-info-text">
              {{ texts.linkText }}
            </div>
            <ui-button

              :type="1"
              :wide="true"
              class="link"
              size="large"
              @click="generateLinkHandler"
            >
              {{ texts.generateUrl }}
            </ui-button>
          </div>
          <div v-show="hasLink">
            <div class="top-info-text">
              {{ $tc("workspace.channelInvite.linkDisableTimeout", fancyTimer) }}
            </div>

            <ui-input
              v-model="tempURL"
              readonly
              class="l-mb-12"
            />
            <ui-button
              :type="1"
              :wide="true"
              size="large"
              class="link l-mb-12"
              @click="copyLinkHandler"
            >
              {{ texts.copyLink }}
            </ui-button>
            <ui-button
              :type="3"
              :wide="true"
              size="large"
              class="link"
              @click="deactivateInvite"
            >
              {{ texts.deactivateLink }}
            </ui-button>
          </div>
        </tab>
      </tabs>
    </template>

    <template
      v-if="selectedTab === texts.userTab"
      #footer
    >
      <ui-button
        :type="1"
        size="large"
        :disabled="!selectedUsers.length && !selectedGroups.length"
        wide
        @click="sendInvites"
      >
        {{ $tc("slackInvite.inviteUsers", invitesAmount) }}
      </ui-button>
    </template>
  </pseudo-popup>
</template>

<script>
import UiButton from '@components/UiButton';
import { Tabs, Tab } from '@components/Tabs';
import { List, ListItem } from '@components/List';
import { UiInput } from '@components/Form';
import Avatar from '@components/Avatar';
import PseudoPopup from '@components/PseudoPopup';
import { mapGetters } from 'vuex';
import { WEB_URL } from '@sdk/Constants';
import { msToTime } from '@libs/texts';
import notify from '@libs/notify';

let nowInterval;
let inviteId;

export default {
  components: {
    UiButton,
    Tabs,
    Tab,
    List,
    ListItem,
    UiInput,
    Avatar,
    PseudoPopup,
  },

  data() {
    return {
      filterKey: '',
      hasLink: false,
      tempURL: null,
      expiredAt: null,
      groups: [],
      filteredGroups: [],
      selectedGroups: [],
      filteredWorkspaceUsers: [],
      selectedUsers: [],
      selectedTab: null,
      now: Date.now(),
    };
  },

  computed: {
    ...mapGetters({
      selectedWorkspaceId: 'me/getSelectedWorkspaceId',
      getAllUsers: 'users/getAllUsers',
      myId: 'me/getMyId',
      userAvatar: 'users/getUserAvatarUrl',
      getUsersInAllChannels: 'channels/getUsersInAllChannels',
      getChannelById: 'channels/getChannelById',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('workspace.channelInvite');
    },

    /**
     * Channel id
     * @returns {string}
     */
    channelId() {
      return this.$route.params?.id;
    },

    /**
     * Workspace users (without guests)
     * @returns {object}
     */
    workspaceUsers() {
      return this.getAllUsers.filter(user => user.role !== 'guest' && user.id !== this.myId);
    },

    fancyTimer() {
      if (!this.expiredAt) {
        return '';
      }
      const deltaTime = this.expiredAt - this.now;

      if (deltaTime <= 0) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.hasLink = false;
      }

      return msToTime(deltaTime);
    },

    invitesAmount() {
      const groupUsersCount = this.selectedGroups.reduce((val, el) => {
        return val + el.membersCount;
      }, 0);

      return groupUsersCount + this.selectedUsers.length;
    },

  },

  created() {
    const second = 1000;

    nowInterval = setInterval(() => {
      this.now += second;
    }, second);
  },

  async mounted() {
    try {
      const { token, id, expiredAt } = await this.$API.channel.getInvite(this.channelId);
      let url;

      if (token) {
        url = `${WEB_URL}/guest/${token}`;
      }
      inviteId = id;
      this.tempURL = url;
      console.log(expiredAt);
      this.expiredAt = new Date(expiredAt).getTime();
      this.hasLink = true;
    } catch (err) {

    }

    this.groups = await this.$API.group.getGroups(this.selectedWorkspaceId);
  },

  beforeDestroy() {
    clearInterval(nowInterval);
  },

  methods: {
    async generateLinkHandler() {
      try {
        const { url, id, expiredAt } = await this.$store.dispatch('channels/copyInviteLink', this.channelId);

        this.tempURL = url;
        inviteId = id;
        console.log(expiredAt);
        this.expiredAt = new Date(expiredAt).getTime();
        this.hasLink = true;
      } catch (err) {
        console.log(err);
      }
    },

    async copyLinkHandler() {
      navigator.clipboard.writeText(this.tempURL);

      notify('workspace.channel.inviteCopied', {
        icon: 'tick',
      });

      this.hasLink = true;
    },

    async deactivateInvite() {
      try {
        await this.$API.channel.deleteInvite(inviteId);
        this.hasLink = false;

        notify('workspace.channelInvite.linkDeactivatedNotif');
      } catch (err) {

      }
    },

    isUserOffline(user) {
      if (user.onlineStatus === 'offline') {
        return true;
      }

      return false;
    },

    isUserInSameChannel(user) {
      if (this.getUsersInAllChannels[user.id] === this.channelId) {
        return true;
      }

      return false;
    },

    userChannelName(userId) {
      const id = this.getUsersInAllChannels[userId];

      if (!id) {
        return null;
      }

      return this.getChannelById(id);
    },

    selectUser(data) {
      this.selectedUsers = data;
    },

    selectGroup(data) {
      this.selectedGroups = data;
    },

    async sendInvites() {
      try {
        for (const user of this.selectedUsers) {
          await this.sendOneInvite(user.id);
        }

        for (const group of this.selectedGroups) {
          const groupUsers = await this.$API.group.getMembers(group.id);

          for (const user of groupUsers) {
            await this.sendOneInvite(user.id);
          }
        }

        this.__backOrRedirect();

        notify('workspace.channelInvite.invitationsSent', {
          icon: 'tick',
        });
      } catch (err) {
        console.error(err);
      }
    },

    async sendOneInvite(userId) {
      await this.$store.dispatch('app/sendPush', {
        userId,
        isResponseNeeded: true,
        message: {
          action: 'invite',
          channelId: this.channelId,
        },
      });
    },

    /**
     * Close handler
     * @returns {void}
     */
    closeHandler() {
      this.__backOrRedirect();
    },
  },

};
</script>

<style lang="stylus" scoped>

.top-info-text
  margin 42px 0 28px

.user-search__wrapper
  position relative
  background-color var(--new-bg-04)
  padding 6px 0 12px
  z-index 1

  &.ui-sticked:after
    content ''
    position absolute
    bottom 0
    width calc(100% + 32px)
    height 1px
    left -16px
    background-color var(--new-stroke-01)

/deep/ .user-search .input
  padding-left 54px

/deep/ .input__icon
  padding-left 10px

.user
  padding 4px 10px
  line-height 16px
  display flex
  flex-direction row
  align-items center
  margin-bottom 2px
  border-radius 6px
  cursor pointer
  height 44px
  margin-bottom 4px

  &:hover
    background-color var(--new-UI-06)

  &--offline
    opacity 0.5
    pointer-events none

  &__check
    margin 0 5px
    padding 1px
    box-sizing border-box
    flex-shrink 0
    color transparent
    border 1px solid var(--new-UI-05)
    border-radius 50%

  &.list-item--selected
    background-color initial

    &:hover
      background-color var(--new-UI-06)

    & .user__check
      background-color var(--new-UI-01)
      color var(--new-white)
      padding 2px
      border none

  &__avatar
    margin-right 12px
    flex-shrink 0

    &--group
      display flex
      flex-direction row
      justify-content center
      align-items center
      flex-shrink 0
      width 32px
      height 32px
      border-radius 100%
      background var(--new-UI-01-3)
      border 1px solid var(--new-stroke-01)
      color var(--new-UI-01)

  &__inner
    display flex
    flex-direction column
    align-items flex-start
    flex-grow 1

  &__channel
    font-size 12px
    margin-top 4px
    color var(--new-UI-04)
    display flex
    flex-direction row
    align-items center

    &__icon
      color var(--new-signal-02)

</style>
