<template>
  <div class="l-p-8">

    <div class="connected-channel" v-if="connectedChannel.name" @click="clickChannelHandler(connectedChannel)">
       <channel-item :channel="connectedChannel">
         <ui-button
          slot="right-button"
          :type="7"
          class="connected-channel__button"
          size="small"
          height="16"
          icon="more">
        </ui-button>
       </channel-item>
    </div>
    <div class="channel-header">
      <div class="channel-header__label l-ml-4">Channels</div>
      <ui-button :type="7" class="channel-header__add" @click.native="addRandomChannelHandler" size="small" icon="add"></ui-button>
    </div>

    <list :filterBy="''">
      <list-item
        @click.native="clickChannelHandler(channel)"
        @dblclick.native="dbclickChannelHandler(channel)"
        v-for="channel in sortedChannels"
        :key="channel.name"
        :active="channel.active"
        :filterKey="channel.name"
        v-show="!channel.connected"
        button
      >
       <channel-item :channel="channel"></channel-item>
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
      channels: [
        {
          name: 'heyka-dev',
          type: 'public',
          talking: true,
          active: false,
          online: [
            { name: 'Ivan' },
            { name: 'Mika' },
            { name: 'Eugene' },
          ],
        },
        {
          name: 'Designers',
          type: 'public',
          active: false,
          online: [],
        },
        {
          name: 'Chit-chat with long name',
          type: 'private',
          active: false,
          online: [
            { name: 'Ivan' },
            { name: 'Mika' },
            { name: 'Eugene' },
            { name: 'Ivan2' },
            { name: 'Mika2' },
            { name: 'Eugene2' },
            { name: 'Ivan3' },
            { name: 'Mika3' },
            { name: 'Eugene3' },
          ],
        },
      ],
      connectedChannel: {
        name: '',
        online: [],
      },
    };
  },

  computed: {

    /**
     * Sort channels by name
     * @returns {Array} array of sorted channels
     */
    sortedChannels() {
      const ch = [ ...this.channels ];

      return ch.sort((a, b) => {
        if (a.name.toLowerCase().trim() < b.name.toLowerCase().trim()) {
          return -1;
        }
        if (a.name.toLowerCase().trim() > b.name.toLowerCase().trim()) {
          return 1;
        }

        return 0;
      });
    },

  },

  methods: {
    /**
     * Make Channel active and route to its info
     * @param {Object} channel selected channel
     * @returns {void}
     */
    clickChannelHandler(channel) { // TODO: добавить роутинг
      for (const ch of this.channels) {
        ch.active = false;
      }
      this.$set(channel, 'active', true);
    },

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
     * Substitution for proper channel creation
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
      const chtypes = ['public', 'private'];
      const channelType = chtypes[Math.floor(Math.random() * chtypes.length)];

      this.channels.push({
        name: channelName,
        type: channelType,
        active: false,
        online: [],
      });
    },

  },

};
</script>

<style lang="stylus" scoped>
.connected-channel
  margin-bottom 8px

  &__button
    color var(--icon-1)
    margin-right 4px

.channel-header
  display flex
  flex-direction row
  justify-content space-between
  align-items center
  color var(--text-1)
  margin-bottom 2px
  font-size 12px

</style>