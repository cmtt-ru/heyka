<template>
  <div
    id="sidebar_channel_anchor"
    class="l-p-12"
  >
    <!------ search ------>
    <div
      v-click-outside="deactivateInput"
      class="search-wrapper"
    >
      <div
        v-show="inputActive"

        class="search"
      >
        <ui-input
          ref="globalSearch"
          v-model="searchText"
          icon="search"
          class="search__input"
          :placeholder="texts.search"
          @keydown.native.esc="closeInput"
        />
        <svg-icon
          v-show="searchText"
          class="search__icon--close"
          name="clear"
          width="16"
          height="16"
          @click.native="closeInput"
        />
      </div>

      <div
        v-show="!inputActive"
        class="search search--mockup"
        @click="activateInput"
      >
        <svg-icon
          class="search__icon"
          name="search"
          color="var(--new-UI-01)"
          width="20"
          height="20"
        />
        <div>{{ texts.search }}</div>
      </div>
    </div>

    <!------ channels ------>
    <transition name="connected-channel">
      <div
        v-if="selectedChannel"
        class="connected-channel"
      >
        <channel-item
          :channel="selectedChannel"
          top-channel
        />
      </div>
    </transition>

    <div class="channel-header">
      <a
        href="#sidebar_channel_anchor"
        class="channel-header__label"
      >{{ texts.channelsHeader }}</a>
      <router-link
        :to="{name: 'create-channel'}"
      >
        <ui-button
          v-tooltip="$t('tooltips.newChannel')"
          :type="7"
          class="channel-header__add"
          size="small"
          icon="add"
          @click.native="createChannelHandler"
        />
      </router-link>
    </div>

    <list
      v-if="channels.length"
      :filter-by="searchText"
      class="channels-list"
    >
      <list-item
        v-for="channel in showedChannels"
        :key="channel.id"
        :filter-key="channel.name"
        button
        @dblclick.native="dbclickChannelHandler(channel)"
      >
        <transition name="list-channel">
          <channel-item
            v-show="notSelected(channel.id)"
            :channel="channel"
            class="list-channel"
          />
        </transition>
      </list-item>
    </list>
    <div v-if="!searchText">
      <router-link
        v-if="channels.length<=MANY_CHANNELS"
        :to="{name: 'create-channel'}"
        class="action-button"
        @click="createChannelHandler"
      >
        <svg-icon
          class="action-button__icon"
          name="add"
          size="medium"
        />
        <div>{{ texts.createChannel }}</div>
      </router-link>
      <a
        v-else
        class="action-button"
        :href="showMore && '#sidebar_channel_anchor'"
        @click="toggleChannelsHandler"
      >
        <svg-icon
          class="action-button__icon"
          name="arrow-down"
          :class="{'action-button__icon--flipped': !showMore}"
          size="medium"
        />
        <div>{{ toggleChannelText }}</div>
      </a>
    </div>

    <!------ users ------>
    <div
      id="sidebar_user_anchor"
      class="user-anchor"
    />
    <div class="channel-header user-header">
      <a
        href="#sidebar_user_anchor"
        class="channel-header__label"
      >{{ texts.usersHeader }}</a>
      <router-link :to="{name: 'invite'}">
        <ui-button
          v-tooltip="$t('tooltips.newUser')"
          :type="7"
          class="channel-header__add"
          size="small"
          icon="add"
        />
      </router-link>
    </div>

    <list
      v-if="sidebarUsers.length"
      :filter-by="searchText"
    >
      <list-item
        v-for="user in sidebarUsers"
        :key="user.id"
        :filter-key="user.name"
        button
      >
        <sidebar-user-item
          v-show="user.onlineStatus!=='offline' || searchText!==''"
          :user="user"
        />
      </list-item>
    </list>
    <router-link
      v-if="!searchText"
      :to="{name: 'invite'}"
      class="action-button"
    >
      <svg-icon
        class="action-button__icon"
        name="add"
        size="medium"
      />
      <div>{{ texts.inviteUser }}</div>
    </router-link>
  </div>
</template>

<script>
import ChannelItem from '@components/ChannelItem';
import { List, ListItem } from '@components/List';
import UiButton from '@components/UiButton';
import { UiInput } from '@components/Form';
import SidebarUserItem from '@components/SidebarUserItem';
import Mousetrap from 'mousetrap';
import { mapGetters, mapState } from 'vuex';

const MANY_CHANNELS = 4;

export default {
  components: {
    List,
    ListItem,
    ChannelItem,
    UiButton,
    UiInput,
    SidebarUserItem,
  },

  data() {
    return {
      MANY_CHANNELS,
      inputActive: false,
      searchText: '',
    };
  },

  computed: {

    ...mapGetters({
      channels: 'channels/getChannels',
      getAllUsers: 'users/getAllUsersByFrequency',
    }),

    ...mapState('app', {
      showMore: 'showMoreChannels',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('workspace.navbar');
    },

    sortedChannels() {
      return [ ...this.channels ].sort((a, b) =>
        (b.isTemporary ? Infinity : (b.userRelation?.usageCount || 0)) -
        (a.isTemporary ? Infinity : (a.userRelation?.usageCount || 0))
      );
    },

    /**
     * Get pseudo-selected channel for faster bubbling animation
     * @returns {object} - channel
     */
    selectedChannel() {
      const selectedChannelId = this.$store.state.app.animationChannel || '';

      return this.$store.getters['channels/getChannelById'](selectedChannelId);
    },

    /**
     * Workspace users (without guests)
     * @returns {object}
     */
    sidebarUsers() {
      return this.getAllUsers.filter(user => user.role !== 'guest');
    },

    /**
     * Show either all or onlyfirst 4 channels
     * @returns {object}
     */
    showedChannels() {
      if (!this.showAll) {
        return this.sortedChannels.slice(0, MANY_CHANNELS);
      }

      return this.sortedChannels;
    },

    /**
     * True if we should display all channels
     * @returns {boolean}
     */
    showAll() {
      return (!this.showMore || !!this.searchText);
    },

    /**
     * Dynamic "Show more"/"Show less" text
     * @returns {string}
     */
    toggleChannelText() {
      if (this.showMore) {
        return this.texts.showChannels;
      } else {
        return this.texts.hideChannels;
      }
    },

    /**
     * Search string in vuex
     *
     * @returns {string}
     */
    // searchText: {
    //   get() {
    //     return this.$store.state.app.search;
    //   },
    //   set(value) {
    //     this.$store.commit('app/SET_SEARCH_TEXT', value);
    //   },
    // },

  },

  created() {
    Mousetrap.bind(['command+f', 'ctrl+f'], () => {
      this.activateInput(false);
    });
  },

  beforeDestroy() {
    Mousetrap.unbind(['command+f', 'ctrl+f']);
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

    /**
     * "Show more"/"Show less" state
     * @returns {void}
     */
    toggleChannelsHandler() {
      this.$store.commit('app/SET_CHANNELS_EXPANDED', !this.showMore);
    },

    /**
     * Show searchbar
     * @param {boolean} clear true if e should clear input
     * @returns {void}
     */
    activateInput(clear = true) {
      if (clear) {
        this.searchText = '';
      }

      this.inputActive = true;
      this.$nextTick(() => {
        this.$refs.globalSearch.focusInput();
      });
    },

    /**
     * Close searchbar if it is empty
     * @returns {void}
     */
    deactivateInput() {
      if (this.searchText === '') {
        this.inputActive = false;
      }
    },

    /**
     * Close searchbar
     * @returns {void}
     */
    async closeInput() {
      this.searchText = '';
      this.inputActive = false;
    },

  },

};
</script>

<style lang="stylus" scoped>

$ANIM = 250ms

/deep/ .input
  padding-right 26px
  padding-left 33px
  height 26px
  min-height 26px
  box-sizing border-box
  font-weight 500

  &::placeholder
    font-weight 500

.search-wrapper
  position sticky
  top 0
  z-index 20
  background-color var(--new-bg-01)
  padding 12px 0
  margin-top -12px

.search
  height 28px
  display flex
  flex-direction row
  justify-content flex-start
  align-items center
  border-radius 6px
  cursor pointer
  position relative

  &--mockup

    &:hover
      background-color var(--new-UI-07)

    &:active
      background-color var(--new-UI-08)

  &__icon
    margin 0 7px

    &--close
      position absolute
      right 6px
      top 0
      bottom 0
      margin auto 0

      &:hover
        color var(--new-UI-04)

.action-button
  padding 4px 8px
  margin 2px 0
  width 100%
  height 24px
  box-sizing border-box
  border-radius 6px
  color var(--new-UI-04)
  font-weight bold
  display flex
  flex-direction row
  align-items center
  justify-content flex-start
  cursor pointer

  &:hover
    background-color var(--new-UI-07)

  &:active
    background-color var(--new-UI-08)

  &.router-link-active .action-button__icon
    color var(--new-UI-01)

  &__icon
    margin-right 10px
    transition all 0.1s ease

    &--flipped
      transform rotate(180deg)

.channel-header
  display flex
  background-color var(--new-bg-01)
  flex-direction row
  justify-content space-between
  align-items center
  color var(--new-UI-04)
  font-size 12px
  font-weight bold
  position sticky
  top 52px
  z-index 10
  padding 2px 0 2px 8px

.router-link-active .channel-header__add
  color var(--new-UI-01)

.user-header
  margin-top 22px
  top 79px
  bottom 0

.user-anchor
  transform translateY(-25px)

.channels-list
  background-color var(--new-bg-01)
  position relative

.connected-channel
  margin-top 16px
  margin-bottom 0px

.connected-channel-enter
  opacity 0
  transform translateY(45px)
  margin-bottom -45px
  margin-top 0px

.connected-channel-enter-to
  margin-top 16px
  transition all $ANIM ease

.connected-channel-leave
  margin-top 16px

.connected-channel-leave-to
  opacity 0
  transform translateY(45px)
  margin-bottom -45px
  margin-top 0px
  transition all $ANIM ease

.list-channel-enter
  opacity 0
  transform translateY(-40px)
  margin-top -45px

.list-channel-enter-to
  transition all $ANIM ease

.list-channel-leave
  margin-top 2px

.list-channel-leave-to
  opacity 0
  transform translateY(-40px)
  margin-top -45px
  transition all $ANIM ease

</style>
