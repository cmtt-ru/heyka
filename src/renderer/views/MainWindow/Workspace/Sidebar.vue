<template>
  <div class="l-p-8">

    <div class="connected-channel" v-if="selectedChannel">
       <channel-item @more="moreHandler()" :channel="selectedChannel"/>
    </div>

    <div class="channel-header">
      <div class="channel-header__label l-ml-4">Channels</div>
      <ui-button :type="7" class="channel-header__add" @click.native="createChannelHandler" size="small" icon="add"></ui-button>
    </div>

    <list :filterBy="''" v-if="sortedChannels.length">
      <list-item
        @dblclick.native="dbclickChannelHandler(channel)"
        v-for="channel in sortedChannels"
        :key="channel.name"
        :filterKey="channel.name"
        button
      >
       <channel-item @more="moreHandler()" :channel="channel"/>
      </list-item>

    </list>

    <div class="channel-header">
      <div class="channel-header__label l-ml-4">Users</div>
      <ui-button :type="7" class="channel-header__add" @click.native="addUserHandler" size="small" icon="add"></ui-button>
    </div>

    <list :filterBy="''" v-if="sortedUsers.length">
      <list-item
        v-for="user in sortedUsers"
        :key="user.name"
        :filterKey="user.name"
        button
      >
       <sidebar-user-item @more="moreHandler()" :user="user"/>
      </list-item>

    </list>
  </div>

</template>

<script>
import ChannelItem from '@components/ChannelItem';
import { List, ListItem } from '@components/List';
import UiButton from '@components/UiButton';
import SidebarUserItem from '@components/SidebarUserItem';

export default {
  components: {
    List,
    ListItem,
    ChannelItem,
    UiButton,
    SidebarUserItem,
  },

  data() {
    return {

    };
  },

  computed: {
    /**
     * Sort channels by name
     * @returns {array} – array of sorted channels
     */
    sortedChannels() {
      return this.$store.getters['channels/getChannels'].filter(channel => {
        return !(this.selectedChannel && channel.id === this.selectedChannel.id);
      });
    },

    /**
     * Sort users by online status and name
     * @returns {array} – array of sorted users
     */
    sortedUsers() {
      const users = this.$store.getters['users/getAllUsers'];

      return users;
    },

    /**
     * Returns selected channel
     * @returns {object} – channel
     */
    selectedChannel() {
      const selectedChannelId = this.$store.getters['me/getSelectedChannelId'];

      return this.$store.getters['channels/getChannelById'](selectedChannelId);
    },
  },

  methods: {
    /**
     * Connect to channel
     * @param {Object} channel selected channel
     * @returns {void}
     */
    async dbclickChannelHandler(channel) {
      // TODO: добавить коннект к сокетам и всё такое
      await this.$store.dispatch('selectChannel', channel.id);
    },

    /**
     * Show channel creation pseudo-popup
     * @returns {void}
     */
    createChannelHandler() {
      console.log('Create new channel handler');
    },

    /**
     * Show add-user pseudo-popup
     * @returns {void}
     */
    addUserHandler() {
      console.log('Add new user handler');
    },

    /**
     * Dummy popover creation
     * @returns {void}
     */
    moreHandler() {
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
