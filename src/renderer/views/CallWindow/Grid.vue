<template>
  <div class="call-window">

    <div class="top-content">
      <div class="left-info">
        <div class="channel-name">
            <svg-icon name="channel" size="small"/>
            <span>{{ selectedChannelName }}</span>
          </div>
        <div>{{ $tc("call.grid.users", usersCount) }}</div>
      </div>
      <ui-button
      class="call-buttons__button"
      :type="7"
      size="medium"
      icon="settings"
      v-popover.click="{name: 'Devices'}"
    />
    </div>

    <div
      id="cell-grid"
      class="cell-grid"
      :style="padding"
    >

      <div class="cell"
        v-for="(user, index) in users" :key="index"
        :style="cellDimensions(index)"
      >
        <div class="cell__inner" :class="{'cell__inner--talking': user.speaking}">

          <div class="cell__feed"></div>

          <ui-button
            class="cell__more"
            :type="7"
            size="medium"
            icon="more"
            v-popover.click="{name: 'GridUser', data: {userId: user.id}}"
          />
           <avatar
          class="cell__avatar"
          :image="user.avatar"
          :size="100"
          square/>
          <div  class="cell__username">
            <div v-textfade>{{user.name}}</div>
            <div v-if="user.id === myId" class="cell__username__you">{{texts.you}}</div>
            <svg-icon
                v-if="!user.microphone"
                class="cell__username__mic-off"
                name="mic-off"
                size="small"/>
            </div>
        </div>
      </div>

    </div>

    <call-buttons class="bottom-control" :buttons="['screen', 'speakers', 'microphone', 'leave']"
  size="large"></call-buttons>
  </div>
</template>

<script>
/* eslint-disable no-magic-numbers */
import CallButtons from '../CallOverlayWindow/CallButtons';
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import { GRIDS } from './grids';

const ASPECT_RATIO = 124 / 168;
const PADDING = 20;

export default {
  components: {
    CallButtons,
    UiButton,
    Avatar,
  },
  data() {
    return {
      currentGrid: [],
      avatarWidth: null,
      padding: {},
    };
  },
  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('call.grid');
    },

    grids() {
      return GRIDS[this.usersCount];
    },
    /**
     * Get our media state
     * @returns {object}
     */
    mediaState() {
      return this.$store.getters['me/getMediaState'];
    },

    /**
     * Get our ID
     * @returns {object}
     */
    myId() {
      return this.$store.getters['me/getMyId'];
    },

    /**
     * Get channel ID from route param
     * @returns {string} – channel ID
     */
    channelId() {
      return this.$store.getters['me/getSelectedChannelId'];
    },

    /**
     * Selected channel
     * @return {object}
     */
    selectedChannel() {
      const selectedChannel = this.$store.getters['channels/getChannelById'](this.channelId);

      if (selectedChannel) {
        return selectedChannel;
      }

      return false;
    },
    /**
     * Get users array
     * @returns {array} array of users
     */
    users() {
      return this.$store.getters.getUsersByChannel(this.channelId);
    },

    usersCount() {
      return this.users.length;
    },

    /**
     * Selected channel name
     * @return {string}
     */
    selectedChannelName() {
      if (this.selectedChannel) {
        return this.selectedChannel.name;
      }

      return 'no channel selected';
    },

  },
  methods: {

    cellDimensions(index) {
      return {
        width: this.avatarWidth * this.currentGrid[index] + 'px',
        height: this.avatarWidth * ASPECT_RATIO * this.currentGrid[index] + 'px',
      };
    },

    resize() {
      const bounds = document.getElementById('cell-grid');
      const boundHeight = bounds.offsetHeight - PADDING * 2;
      const boundWidth = bounds.offsetWidth - PADDING * 2;
      const closest = this.findClosest(boundHeight / boundWidth, this.grids);

      this.currentGrid = closest.sizes;

      this.avatarWidth = Math.min(boundWidth, boundHeight / closest.ratio);

      if (boundHeight / boundWidth < closest.ratio) {
        this.padding = { padding: '0 ' + (boundWidth - boundHeight / closest.ratio) / 2 + 'px' };
      } else {
        this.padding = { padding: '0' };
      }
    },

    findClosest(val, arr) {
      return arr.reduce((a, b) => {
        return Math.abs(b.ratio - val) < Math.abs(a.ratio - val) ? b : a;
      });
    },
  },
  mounted() {
    window.addEventListener('resize', this.resize, false); // TODO: add small debounce for performance
    this.resize();
  },
  destroyed() {
    window.removeEventListener('resize', this.resize, false);
  },
};
</script>

<style lang="stylus" scoped>
  .call-window
    display flex
    flex-direction column
    height 100vh

  .top-content
    height 116px
    box-sizing border-box
    padding 24px 40px
    font-weight 500
    font-size 36px
    line-height 42px
    display flex
    flex-direction row
    justify-content space-between
    align-items flex-start

  .left-info
    display grid

  .channel-name
    font-size 14px
    line-height 18px
    color var(--text-1)

  .cell-grid
    height calc(100vh - 232px)
    //border 2px solid white
    display flex
    flex-direction row
    flex-wrap wrap
    align-items center
    justify-content center
    align-content center
    box-sizing border-box

  .cell
    padding 4px
    box-sizing border-box

    &__inner
      border-radius 8px
      height 100%
      padding 8px
      box-sizing border-box
      display flex
      flex-direction column
      justify-content space-between
      align-items center
      position relative

      &--talking
        border 2px solid var(--color-1)
        padding 6px

    &__feed
      position absolute
      top 0
      left 0
      right 0
      bottom 0
      background-color #222c2d
      border-radius 8px

    &__more
      margin-left auto
      flex-shrink 0
      opacity 0
      transition opacity 0.15s ease
      position relative

    .cell__inner:hover .cell__more
      opacity 1

    .cell__more.context-menu--opened
      opacity 1

    &__avatar
      border-radius 4px
      overflow hidden

    &__username
      background-color var(--app-bg)
      padding 8px
      border-radius 4px
      flex-shrink 0
      max-width calc(100% - 16px)
      width auto
      overflow hidden
      display flex
      flex-direction row
      align-items center
      text-align center
      position relative

      &__you
        color var(--text-1)
        margin-left 8px

      &__mic-off
        margin-left 8px

  .bottom-control
    margin 28px auto 0
</style>
