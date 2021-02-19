<template>
  <pseudo-popup
    :header-has-shadow="false"
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
            v-sticky.top="43"
            class="user-search__wrapper"
          >
            <ui-input
              ref="top_slack_invite"
              v-model="filterKey"
              icon="search"
              :placeholder="$t('techTexts.search')"
              class="user-search"
            />
          </div>
          <list
            ref="userList"
            class="user-list"
            selectable
            :filter-by="filterKey"
            @multipick="selectUser"
          >
            <list-item
              v-for="user in workspaceUsers"
              :key="user.id"
              :filter-key="user.name"
              :selectable-content="user"
              :class="{'user--offline': isUserOffline(user) || isUserInSameChannel(user) }"
              button
              class="user"
            >
              <avatar
                class="user__avatar"
                :status="user.onlineStatus === 'online' ? '' : user.onlineStatus"
                :image="userAvatar(user.id, 32)"
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

    <template #footer>
      <div
        v-if="selectedTab === texts.userTab"
        class="submit-button-wrapper"
      >
        <ui-button
          :type="3"
          class="l-mr-12"
          size="large"
          @click="closeHandler"
        >
          {{ $t('techTexts.cancel') }}
        </ui-button>
        <ui-button
          :type="1"
          size="large"
          :disabled="!selectedUsers.length"
          @click="sendInvites"
        >
          {{ $tc("slackInvite.inviteUsers", selectedUsers.length) }}
        </ui-button>
      </div>

      <div v-else>
        <ui-button
          :type="3"
          class="l-mr-12"
          size="large"
          @click="closeHandler"
        >
          {{ $t('techTexts.close') }}
        </ui-button>
      </div>
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

      const notification = {
        data: {
          text: this.$t('workspace.channel').inviteCopied,
        },
      };

      await this.$store.dispatch('app/addNotification', notification);
      this.hasLink = true;
    },

    async deactivateInvite() {
      try {
        await this.$API.channel.deleteInvite(inviteId);
        this.hasLink = false;

        const notification = {
          data: {
            text: this.texts.linkDeactivatedNotif,
          },
        };

        await this.$store.dispatch('app/addNotification', notification);
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

    async sendInvites() {
      try {
        for (const user of this.selectedUsers) {
          console.log(user);
          await this.$store.dispatch('app/sendPush', {
            userId: user.id,
            isResponseNeeded: true,
            message: {
              action: 'invite',
              channelId: this.channelId,
            },
          });
        }
        //! уведомление об успешном приглашении
        this.$router.back();
      } catch (err) {
        console.error(err);
      }
    },

    /**
     * Close handler
     * @returns {void}
     */
    closeHandler() {
      this.$router.back();
    },
  },

};
</script>

<style lang="stylus" scoped>

.top-info-text
  margin 42px 0 28px

.user-search__wrapper
  background-color var(--new-bg-04)
  padding 6px 0 12px
  z-index 1
  position relative

  &.ui-sticked:after
    content ''
    position absolute
    bottom 0
    width calc(100% + 32px)
    height 1px
    left -16px
    background-color var(--new-UI-06)

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

  &__channel
    font-size 12px
    color var(--new-UI-04)
    display flex
    flex-direction row
    align-items center

    &__icon
      color var(--new-signal-02)

.link__copied-text
  font-size 12px
  margin-top 20px
  color var(--text-1)

.success
  display inline-block
  margin-bottom 16px

  &__tick
    transform translateY(2px)

</style>