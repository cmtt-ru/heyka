<template>
  <div class="l-p-8">
    <div
      v-if="channel"
      class="channel-info"
    >
      <svg-icon
        class="channel-info__type"
        :name="dynamicIcon"
        size="medium"
        stroke="var(--icon-1)"
      />
      <div
        v-textfade="channel.name"
        class="channel-info__name"
      >
        {{ channel.name }}
      </div>
      <ui-button
        :type="7"
        class="channel-info__more"
        size="small"
        height="16"
        icon="more"
        @click.native="moreHandler()"
      />

      <ui-button
        v-if="!isConnected"
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

    <list :filter-by="''">
      <list-item
        v-for="user in users"
        :key="user.name"
        :filter-key="user.name"
        button
      >
        <channel-user-item :user="user" />
      </list-item>
    </list>
  </div>
</template>

<script>
import { List, ListItem } from '@components/List';
import ChannelUserItem from '@components/ChannelUserItem';
import UiButton from '@components/UiButton';

const ICON_MAP = {
  public: 'channel',
  publicOnline: 'channelOnAir',
  private: 'lock',
  temp: 'clock',
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
      if (this.channel.isPrivate) { // TODO: lifespan
        return ICON_MAP['private'];
      } else {
        if (this.channel.talking) {
          return ICON_MAP['publicOnline'];
        } else {
          return ICON_MAP['public'];
        }
      }
    },

  },

  methods: {

    /**
     * Connect to channel
     * @returns {void}
     */
    async clickConnectHandler() {
      // TODO: добавить коннект к сокетам и всё такое
      await this.$store.dispatch('selectChannel', this.channelId);
    },

    /**
     * Disconnect from channel
     * @returns {void}
     */
    async clickDisconnectHandler() {
      // TODO: добавить дисконнект от сокетов и всё такое
      await this.$store.dispatch('unselectChannel', this.channelId);
    },

    /**
     * Dummy popover creation
     * @returns {void}
     */
    moreHandler() {
      console.log('more');
    },
  },

};
</script>

<style lang="stylus" scoped>

.channel-info
  height 32px
  padding 0 4px 8px 0
  margin-bottom 8px
  width 100%
  box-sizing border-box
  display flex
  flex-direction row
  align-items center
  justify-content flex-start

  &__type
    margin 0 4px
    flex-shrink 0

  &__name
    font-weight 500
    flex-grow 1

  &__more
    color var(--icon-1)
    margin 0 8px
    flex-shrink 0

  &__connect
    flex-shrink 0

</style>
