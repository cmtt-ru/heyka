<template>
  <div class="l-p-8">

    <div class="connected-channel" v-if="connectedChannel.name">
       <channel-item @more="MoreHandler()" :channel="connectedChannel"/>
    </div>

    <div class="channel-header">
      <div class="channel-header__label l-ml-4">Channels</div>
      <ui-button :type="7" class="channel-header__add" @click.native="addRandomChannelHandler" size="small" icon="add"></ui-button>
    </div>

    <list :filterBy="''" v-if="sortedChannels.length">
      <list-item
        @dblclick.native="dbclickChannelHandler(channel)"
        v-for="channel in sortedChannels"
        :key="channel.name"
        :active="channel.active"
        :filterKey="channel.name"
        v-show="!channel.connected"
        button
      >
       <channel-item @more="MoreHandler()" :channel="channel"/>
      </list-item>

    </list>
  </div>

</template>

<script>
import ChannelItem from '@components/ChannelItem';
import { List, ListItem } from '@components/List';
import UiButton from '@components/UiButton';

export default {
  components: {
    List,
    ListItem,
    ChannelItem,
    UiButton,

  },
  data() {
    return {
      connectedChannel: {
        name: '',
        users: [],
      },
    };
  },

  computed: {

    /**
     * Sort channels by name
     * @returns {Array} array of sorted channels
     */
    sortedChannels() {
      console.log(this.$store.getters['channels/getChannels']);

      return this.$store.getters['channels/getChannels'];
    },

  },

  methods: {

    /**
     * Connect to channel
     * @param {Object} channel selected channel
     * @returns {void}
     */
    dbclickChannelHandler(channel) { // TODO: добавить коннект к сокетам и всё такое
      console.log('double click');
      for (const ch of this.channels) {
        ch.connected = false;
      }
      this.$set(channel, 'connected', true);
      this.connectedChannel = channel;
    },

    /**
     * Dummy channel creation
     * @returns {void}
     */
    addRandomChannelHandler() {
      // eslint-disable-next-line no-magic-numbers
      const length = Math.floor(Math.random() * (17)) + 8;
      let channelName = '';
      const characters = 'aaaabcddeeeeeefgihhhiiikllmnnnooooprrrssstttttuwy     ';

      for (let i = 0; i < length; i++) {
        channelName += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      // eslint-disable-next-line no-magic-numbers
      const channelType = (Math.random() < 0.5);

      this.channels.push({
        name: channelName,
        type: channelType,
        active: false,
        users: [],
      });
    },

    /**
     * Dummy popover creation
     * @returns {void}
     */
    MoreHandler() {
      console.log('more');
    },

  },

  created() {

  },

};
</script>

<style lang="stylus" scoped>
.connected-channel
  margin-bottom 8px

.channel-header
  display flex
  flex-direction row
  justify-content space-between
  align-items center
  color var(--text-1)
  margin-bottom 2px
  font-size 12px

</style>