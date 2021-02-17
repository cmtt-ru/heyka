<template>
  <div>
    <div
      v-if="channel"
      v-sticky
      class="channel-info"
    >
      <svg-icon
        class="channel-info__type"
        :name="dynamicIcon"
        :color="dynamicIconColor"
        size="large"
      />

      <div
        v-textfade
        class="channel-info__name"
      >
        {{ channel.name }}
      </div>

      <ui-button
        :key="channel.id"
        v-popover.click="{name: 'Channel', data: {id: channel.id}, permissions: $permissions.editChannel(channel.id)}"
        :type="16"
        class="channel-info__more"
        icon="more"
      />

      <ui-button
        v-if="!isConnected"
        :disabled="janusInProgress"
        :type="1"
        class="channel-info__connect"
        size="small"
        @click.native="clickConnectHandler()"
      >
        {{ texts.join }}
      </ui-button>

      <ui-button
        v-if="isConnected"
        :type="4"
        class="channel-info__connect"
        size="small"
        @click.native="clickDisconnectHandler()"
      >
        {{ texts.disconnect }}
      </ui-button>
    </div>

    <div class="l-pl-12 l-pr-12">
      <list :filter-by="''">
        <list-item
          v-for="user in users"
          :key="user.user.id"
          :filter-key="user.user.name"
          button
        >
          <channel-user-item
            :user="user.user"
            :media-state="user.mediaState"
            :channel-id="channelId"
          />
        </list-item>
      </list>

      <div class="l-flex last-block l-mt-4">
        <router-link :to="{name: 'channel-invite', params: { id: channelId }}">
          <ui-button
            :type="9"
            icon="add"
            style="margin-left: 6px"
          >
            {{ texts.invite }}
          </ui-button>
        </router-link>
      </div>
    </div>

    <div class="bottom-block l-flex">
      <ui-button
        v-if="selectedChannelId"
        :type="14"
        class="l-mr-4"
        @click="audioLagsHandler"
      >
        {{ texts.audioLags }}
      </ui-button>

      <ui-button
        class="l-ml-auto"
        :type="14"
        @click="openIntercom"
      >
        {{ texts.support }}
      </ui-button>
    </div>
  </div>
</template>

<script>
import { List, ListItem } from '@components/List';
import ChannelUserItem from '@components/ChannelUserItem';
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';
import API from '@api';
import intercom from '@classes/intercom';

const ICON_MAP = {
  public: 'channel',
  publicOnline: 'channelOnAir',
  private: 'lock',
  temp: 'time',
  default: 'channel',
};

export default {
  components: {
    List,
    ListItem,
    ChannelUserItem,
    UiButton,
  },

  computed: {
    ...mapGetters({
      selectedChannelId: 'me/getSelectedChannelId',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('workspace.channel');
    },

    /**
     * Get users array
     * @returns {array} array of users
     */
    users() {
      return this.$store.getters.getUsersByChannel(this.channelId);
    },

    /**
     * Get channel ID from route param
     * @returns {string} – channel ID
     */
    channelId() {
      return this.$route.params.id;
    },

    /**
     * Returns current channel
     * @returns {object} – channel
     */
    channel() {
      return this.$store.getters['channels/getChannelById'](this.channelId);
    },

    /**
     * Determine if we are connected to current channel or not
     * @returns {boolean}
     */
    isConnected() {
      return this.$store.getters['me/getSelectedChannelId'] === this.channelId;
    },

    /**
     * Show icon corresponding to channel status
     * @returns {string} name of correct icon
     */
    dynamicIcon() {
      if (this.channel.isPrivate) {
        if (this.channel.isTemporary) {
          return ICON_MAP['temp'];
        } else {
          return ICON_MAP['private'];
        }
      } else {
        return ICON_MAP['public'];
      }
    },

    /**
     * Color icon corresponding to selected channel
     * @returns {string}
     */
    dynamicIconColor() {
      if (this.selectedChannelId === this.channel.id) {
        return 'var(--new-signal-02)';
      } else {
        return 'var(--new-UI-01)';
      }
    },

    janusInProgress() {
      return this.$store.getters['janus/inProgress'];
    },

  },

  beforeDestroy() {
    intercom.hide();
  },

  methods: {
    /**
     * Connect to channel
     * @returns {void}
     */
    async clickConnectHandler() {
      await this.$store.dispatch('selectChannel', this.channelId);
    },

    /**
     * Disconnect from channel
     * @returns {void}
     */
    async clickDisconnectHandler() {
      await this.$store.dispatch('unselectChannel', this.channelId);
    },

    /**
     * Invite link handler
     * @returns {void}
     */
    inviteLinkHandler() {
      this.$store.dispatch('channels/copyInviteLink', this.channelId);
    },

    /**
     * Revoke invites handler
     * @returns {void}
     */
    revokeInviteHandler() {
      this.$store.dispatch('channels/revokeInviteLinks', this.channelId);
    },

    /**
     * Audio lags handler
     * @returns {void}
     */
    async audioLagsHandler() {
      await API.app.reportBadConnection();

      const notification = {
        lifespan: 3000,
        data: {
          text: this.texts['audioLagsNotification'],
        },
      };

      await this.$store.dispatch('app/addNotification', notification);
    },

    /**
     * Open Intercom Widget
     * @returns {void}
     */
    openIntercom() {
      const user = this.$store.getters['users/getUserById'](this.$store.getters['me/getMyId']);

      intercom.init();
      intercom.show();
      intercom.setUserData({
        name: user.name,
        email: user.email,
      });
    },
  },
};
</script>

<style lang="stylus" scoped>

.channel-info
  height 52px
  padding 0 12px 0 8px
  width 100%
  box-sizing border-box
  display flex
  flex-direction row
  align-items center
  justify-content flex-start
  background-color var(--app-bg)
  z-index 1

  &.ui-sticked
    box-shadow 0 0 8px 0 #808080

  &__type
    margin-left 3px
    flex-shrink 0

  &__name
    font-weight 500
    flex-grow 1
    line-height 20px
    margin-left 8px

  &__more
    color var(--icon-1)
    margin 0 6px
    flex-shrink 0

  &__connect
    flex-shrink 0

.last-block
  margin-bottom 48px

.bottom-block
  position fixed
  bottom 0
  padding 8px 12px 8px 18px
  box-sizing border-box
  background-color var(--app-bg)
  width calc(100% - 220px)

</style>
