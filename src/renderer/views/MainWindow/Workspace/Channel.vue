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
        :type="12"
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
          :key="user.id"
          :filter-key="user.name"
          button
        >
          <channel-user-item
            :user="user"
            :channel-id="channelId"
          />
        </list-item>
      </list>

      <div class="l-flex last-block l-mt-24">
        <ui-button
          :type="9"
          icon="add"
          style="margin-left: 6px"
          @click="inviteLinkHandler"
        >
          {{ texts.invite }}
        </ui-button>

        <ui-button
          :type="14"
          class="l-ml-auto l-mr-4"
          @click="revokeInviteHandler"
        >
          {{ texts.revokeInvite }}
        </ui-button>
      </div>

      <div
        v-if="selectedChannelId"
        class="l-flex bottom-block"
      >
        <ui-button
          :type="14"
          class="l-mr-4"
          @click="audioLagsHandler"
        >
          {{ texts.audioLags }}
        </ui-button>
      </div>
    </div>
  </div>
</template>

<script>
import { List, ListItem } from '@components/List';
import ChannelUserItem from '@components/ChannelUserItem';
import UiButton from '@components/UiButton';
import JanusEvents from '@sdk/classes/janusEvents';
import { mapGetters } from 'vuex';

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
    audioLagsHandler() {
      JanusEvents.emit('submit-data');
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
  position absolute
  bottom 0
  padding 8px 0
  box-sizing border-box
  background-color var(--app-bg)
  width 100%

</style>
