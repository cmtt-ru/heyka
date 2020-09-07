<template>
  <div
    id="sidebar_channel_anchor"
    class="l-p-8"
  >
    <transition name="connected-channel">
      <div
        v-if="selectedChannel"
        class="connected-channel"
      >
        <channel-item
          :channel="selectedChannel"
        />
      </div>
    </transition>

    <div class="channel-header">
      <a
        href="#sidebar_channel_anchor"
        class="channel-header__label l-ml-4"
      >{{ texts.channelsHeader }}</a>
      <ui-button
        v-tooltip="$t('tooltips.newChannel')"
        :type="7"
        class="channel-header__add"
        size="small"
        height="16"
        icon="add"
        @click.native="createChannelHandler"
      />
    </div>

    <list
      v-if="channels.length"
      :filter-by="searchText"
    >
      <list-item
        v-for="channel in channels"
        :key="channel.name"
        :filter-key="channel.name"
        button
        @dblclick.native="dbclickChannelHandler(channel)"
      >
        <transition name="list-channel">
          <channel-item
            v-show="notSelected(channel.id)"
            :channel="channel"
            exclude-me
            class="list-channel"
          />
        </transition>
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
      <router-link :to="{name: 'invite'}">
        <ui-button
          v-tooltip="$t('tooltips.newUser')"
          :type="7"
          class="channel-header__add"
          size="small"
          height="16"
          icon="add"
        />
      </router-link>
    </div>

    <list
      v-if="users.length"
      :filter-by="searchText"
    >
      <list-item
        v-for="user in users"
        :key="user.name"
        :filter-key="user.name"
        button
      >
        <sidebar-user-item
          :user="user"
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
import { mapGetters } from 'vuex';

export default {
  components: {
    List,
    ListItem,
    ChannelItem,
    UiButton,
    SidebarUserItem,
  },

  computed: {

    ...mapGetters({
      channels: 'channels/getChannels',
      users: 'users/getAllUsers',
    }),

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
     * Get pseudo-selected channel for faster bubbling animation
     * @returns {object} - channel
     */
    selectedChannel() {
      const selectedChannelId = this.$store.state.app.animationChannel || '';

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
      return id !== this.selectedChannel?.id;
    },

    /**
     * Connect to channel
     * @param {object} channel selected channel
     * @returns {void}
     */
    async dbclickChannelHandler(channel) {
      await this.$store.dispatch('selectChannel', channel.id);
    },

    /**
     * Show channel creation pseudo-popup
     * @returns {void}
     */
    createChannelHandler() {
      this.$router.push({ name: 'create-channel' });
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

$ANIM = 250ms

.connected-channel
  overflow hidden

.connected-channel-enter
  height 0
  opacity 0
  transform translateY(50px)

.connected-channel-enter-to
  height 43px
  transition opacity $ANIM ease, height $ANIM ease, transform $ANIM ease

.connected-channel-leave
  height 43px

.connected-channel-leave-to
  opacity 0
  height 0
  transform translateY(50px)
  transition opacity $ANIM ease, height $ANIM ease, transform $ANIM ease

.list-channel-enter
  opacity 0
  max-height 0
  transform translateY(-40px)
  margin-top -45px

.list-channel-enter-to
  transition opacity $ANIM ease, transform $ANIM ease, margin-top $ANIM ease

.list-channel-leave
  margin-top 2px

.list-channel-leave-to
  opacity 0
  transform translateY(-40px)
  margin-top -45px
  transition opacity $ANIM ease, transform $ANIM ease, margin-top $ANIM ease

</style>
