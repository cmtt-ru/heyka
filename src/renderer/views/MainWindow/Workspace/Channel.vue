<template>
  <div class="channel-page-wrapper">
    <div
      v-if="users.length===0"
      class="empty"
    >
      <div
        class="empty__name"
      >
        <svg-icon
          class="empty__name__icon"
          :name="dynamicIcon"
          :color="dynamicIconColor"
          size="large"
        />
        <div
          v-textfade
          class="empty__name__text"
        >
          {{ channel.name }}
        </div>
      </div>
      <div class="empty__desc">
        {{ texts.emptyDesc }}
      </div>
      <div class="empty__button-row">
        <ui-button
          v-if="!isConnected"
          :disabled="janusInProgress"
          :type="1"
          class="empty__button-connect"
          size="large"
          @click.native="clickConnectHandler()"
        >
          {{ texts.join }}
        </ui-button>
        <ui-button
          :key="channel.id"
          v-popover.click="{name: 'Channel', data: {id: channel.id}, permissions: $permissions.editChannel(channel.id)}"
          :type="16"
          class="empty__button-more"
          icon="more"
        />
      </div>
    </div>

    <pseudo-popup v-else>
      <template #custom-header>
        <div
          v-if="channel"
          class="channel-header"
        >
          <svg-icon
            class="channel-header__type"
            :name="dynamicIcon"
            :color="dynamicIconColor"
            size="large"
          />

          <div
            v-textfade
            class="channel-header__name"
          >
            {{ channel.name }}
          </div>

          <ui-button
            :key="channel.id"
            v-popover.click="{name: 'Channel', data: {id: channel.id}, permissions: $permissions.editChannel(channel.id)}"
            :type="16"
            class="channel-header__more"
            icon="more"
          />

          <ui-button
            v-if="!isConnected"
            :disabled="janusInProgress"
            :type="1"
            class="channel-header__connect"
            size="small"
            @click.native="clickConnectHandler()"
          >
            {{ texts.join }}
          </ui-button>

          <ui-button
            v-if="isConnected"
            :type="4"
            class="channel-header__connect"
            size="small"
            @click.native="clickDisconnectHandler()"
          >
            {{ texts.disconnect }}
          </ui-button>
        </div>
      </template>

      <template #custom-body>
        <div class="channel-user-list">
          <list :filter-by="''">
            <list-item
              v-for="user in sortedUsers"
              :key="user.user.id"
              :filter-key="user.user.name"
              button
              class="channel-user-item"
            >
              <channel-user-item
                :user="user.user"
                :media-state="user.mediaState"
                :channel-id="channelId"
              />
            </list-item>
          </list>

          <div
            v-if="isConnected"
            class="l-flex last-block l-mt-4"
          >
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
      </template>

      <template #custom-footer>
        <div class="channel-footer l-flex">
          <ui-button
            class="l-ml-auto"
            :type="14"
            @click="openIntercom"
          >
            {{ texts.support }}
          </ui-button>
        </div>
      </template>
    </pseudo-popup>
  </div>
</template>

<script>
import { List, ListItem } from '@components/List';
import ChannelUserItem from '@components/ChannelUserItem';
import UiButton from '@components/UiButton';
import PseudoPopup from '@components/PseudoPopup';
import { mapGetters } from 'vuex';
import API from '@api';
import notify from '@libs/notify';

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
    PseudoPopup,
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
     * Display temporary users (guests) last
     * @returns {array} array of sorted users
     */
    sortedUsers() {
      return [...this.users.filter(user => user.user.role !== 'guest'),
        ...this.users.filter(user => user.user.role === 'guest')];
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
        return 'var(--UI-positive)';
      } else {
        return 'var(--UI-active)';
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
     * Audio lags handler
     * @returns {void}
     */
    async audioLagsHandler() {
      await API.app.reportBadConnection();

      notify('workspace.channel.audioLagsNotification', {
        lifespan: 3000,
        icon: 'warning',
      });
    },

    /**
     * Open Intercom Widget
     * @returns {void}
     */
    openIntercom() {
      this.$store.dispatch('app/openIntercom');
    },
  },
};
</script>

<style lang="stylus" scoped>

.channel-page-wrapper
  width 100%
  height 100%

.channel-header
  flex-grow 1
  height 52px
  padding 0 12px 0 8px
  width 100%
  box-sizing border-box
  display flex
  flex-direction row
  align-items center
  justify-content flex-start
  background var(--Background-white)
  z-index 1

  &__type
    margin-left 3px
    flex-shrink 0

  &__name
    font-weight 500
    flex-grow 1
    line-height 16px
    margin-left 8px

  &__more
    color var(--Text-secondary)
    margin 0 6px 0 15px
    flex-shrink 0

  &__connect
    flex-shrink 0

.channel-user-list
  padding 0 12px

.channel-user-item
  padding 2px 0

.last-block
  margin-bottom 12px

.channel-footer
  flex-grow 1
  padding 8px 12px 8px 18px

.empty
  display flex
  width 100%
  height 100%
  padding 26px 26px 126px
  box-sizing border-box
  flex-direction column
  align-items center
  justify-content center

  &__name
    font-weight bold
    font-size 18px
    line-height 28px
    margin-bottom 8px
    display flex
    flex-direction row
    align-items center
    justify-content flex-start
    max-width 100%

    &__icon
      color var(--UI-active)
      margin 0 8px 0 -24px
      width 24px
      height 24px
      flex-shrink 0

  &__desc
    font-size 14px
    line-height 22px
    margin-bottom 16px
    color var(--Text-secondary)
    text-align center

  &__button-row
    display flex

  &__button-more
    height 36px
    width 42px
    margin-left 8px
</style>
