<template>
  <div
    id="sidebar_channel_anchor"
    class="l-p-8"
  >
    <div
      v-if="selectedChannel"
      class="connected-channel"
    >
      <channel-item
        :channel="selectedChannel"
        @more="moreHandler()"
      />
    </div>

    <div class="channel-header">
      <a
        href="#sidebar_channel_anchor"
        class="channel-header__label l-ml-4"
      >{{ texts.channelsHeader }}</a>
      <ui-button
        :type="7"
        class="channel-header__add"
        size="small"
        height="16"
        icon="add"
        @click.native="createChannelHandler"
      />
    </div>

    <list
      v-if="sortedChannels.length"
      :filter-by="searchText"
    >
      <list-item
        v-for="channel in sortedChannels"
        :key="channel.name"
        :filter-key="channel.name"
        button
        @dblclick.native="dbclickChannelHandler(channel)"
      >
        <channel-item
          v-show="notSelected(channel.id)"
          :channel="channel"
          @more="moreHandler()"
        />
      </list-item>
    </list>

    <div
      id="sidebar_user_anchor"
      class="user-anchor"
    />
    <div class="channel-header user-header">
      <a
        href="#sidebar_user_anchor"
        class="channel-header__label l-ml-4"
      >{{ texts.usersHeader }}</a>
      <ui-button
        :type="7"
        class="channel-header__add"
        size="small"
        height="16"
        icon="add"
        @click.native="addUserHandler"
      />
    </div>

    <list
      v-if="sortedUsers.length"
      :filter-by="searchText"
    >
      <list-item
        v-for="user in sortedUsers"
        :key="user.name"
        :filter-key="user.name"
        button
      >
        <sidebar-user-item
          :user="user"
          @more="moreHandler()"
        />
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

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('workspace.navbar');
    },

    /**
     * Get search string from header
     * @returns {string}
     */
    searchText() {
      return this.$store.state.app.search;
    },

    /**
     * Sort channels by name
     * @returns {array} – array of sorted channels
     */
    sortedChannels() {
      return this.$store.getters['channels/getChannels'];
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

  created() {

  },

  methods: {

    /**
     * Filter selected channel out of main list
     * @param {string} id ID of passed channel
     * @returns {boolean} false if channel is selected
     */
    notSelected(id) {
      return !this.selectedChannel || (id !== this.selectedChannel.id);
    },

    /**
     * Connect to channel
     * @param {object} channel selected channel
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

};
</script>

<style lang="stylus" scoped>

.channel-header
  display flex
  background-color var(--app-bg)
  flex-direction row
  justify-content space-between
  align-items center
  color var(--text-1)
  font-size 12px
  position sticky
  top 0
  z-index 1
  padding 5px 4px
  margin-top 7px

.user-header
  top 27px
  bottom 0

.user-anchor
  transform translateY(-25px)

</style>
