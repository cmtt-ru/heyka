<template>
  <div class="call-window">
    <div class="top-content">
      <div class="left-info">
        <span class="channel-name">{{ selectedChannelName }}</span>
        <div>{{people}} users</div>

      </div>

      <ui-button
      class="call-buttons__button"
      :type="7"
      size="medium"
      icon="more"
    />
    </div>
    <div
      id="avatar-grid"
      class="avatar-grid"
      :style="padding"
    >
      <div class="avatar-container"
        v-for="index in people" :key="index"
        :style="avatarDimensions(index-1)"
      >
        <div class="avatar__inner">
          <div>Ivan Bushmin</div>
<!--           <avatar
          class="user__avatar"
          :image="user.avatar"
          :size="50"
          :mic="user.microphone"
          :onair="user.speaking"/> -->
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
/* import Avatar from '@components/Avatar'; */
import { GRIDS } from './grids';

const ASPECT_RATIO = 124 / 168;
const PADDING = 20;

export default {
  components: {
    CallButtons,
    UiButton,
    // Avatar,
  },
  data() {
    return {
      people: 25,
      currentGrid: [],
      avatarWidth: null,
      padding: {},
    };
  },
  computed: {
    grids() {
      return GRIDS[this.people];
    },
    /**
     * Get our media state
     * @returns {object}
     */
    mediaState() {
      return this.$store.getters['me/getMediaState'];
    },

    /**
     * Get our full info
     * @returns {object}
     */
    user() {
      const myId = this.$store.getters['me/getMyId'];
      const commonInfo = this.$store.getters['users/getUserById'](myId);

      return {
        ...commonInfo,
        ...this.mediaState,
      };
    },

    /**
     * Selected channel
     * @return {object}
     */
    selectedChannel() {
      const selectedChannelId = this.$store.getters['me/getSelectedChannelId'];
      const selectedChannel = this.$store.getters['channels/getChannelById'](selectedChannelId);

      if (selectedChannel) {
        return selectedChannel;
      }

      return false;
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

    avatarDimensions(index) {
      // console.log(this.currentGrid);

      return {
        width: this.avatarWidth * this.currentGrid[index] + 'px',
        height: this.avatarWidth * ASPECT_RATIO * this.currentGrid[index] + 'px',
      };
    },

    resize() {
      const bounds = document.getElementById('avatar-grid');
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
    height 136px
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

  .avatar-grid
    height calc(100vh - 272px)
    //border 2px solid white
    display flex
    flex-direction row
    flex-wrap wrap
    align-items center
    justify-content center
    align-content center
    box-sizing border-box

  .avatar-container
    //border 1px solid white
    padding 4px
    box-sizing border-box

  .avatar__inner
    background-color rgb(230,230,230)
    color black
    border-radius 8px
    height 100%
    padding 8px
    box-sizing border-box

  .bottom-control
    margin 48px auto 0
</style>
