<template>
  <div
    class="call-window"
  >
    <div class="top-content">
      <div class="left-info">
        <div class="channel-name">
          <svg-icon
            name="channel"
            size="small"
          />
          <span>{{ selectedChannelName }}</span>
        </div>
        <div>{{ $tc("call.grid.users", usersCount) }}</div>
      </div>
      <ui-button
        class="top-content__devices"
        v-popover.click="{name: 'Devices'}"
        :type="7"
        size="medium"
        icon="settings"
      />
    </div>

    <div
      id="cell-grid"
      class="cell-grid"
      :style="padding"
    >
      <div
        v-for="(user, index) in users"
        :key="user.id"
        class="cell"
        :style="cellDimensions(index)"
      >
        <div
          class="cell__inner"
          @dblclick="expandedClickHandler(user.id)"
        >
          <video
            v-show="videoStreams[user.id]"
            :ref="`video${user.id}`"
            class="cell__feed"
          />
          <div
            v-show="user.speaking && user.microphone"
            class="cell__talking"
          />

          <ui-button
            v-popover.click="{name: 'GridUser', data: {userId: user.id}}"
            class="badge badge--hidden cell__more"
            :type="7"
            size="medium"
            icon="more"
          />

          <avatar
            v-show="!user.camera && !user.screen"
            class="cell__avatar"
            :image="user.avatar"
            :size="100"
            square
          />

          <div
            class="badge cell__username"
            :class="{'cell__username--hidden': isStreaming(user.id)}"
          >
            <div v-textfade>
              {{ user.name }}
            </div>
            <div
              v-if="user.id === myId"
              class="cell__username__you"
            >
              {{ texts.you }}
            </div>
            <svg-icon
              v-if="!user.microphone"
              class="cell__username__mic-off"
              name="mic-off"
              size="small"
            />
          </div>

          <ui-button
            v-if="isStreaming(user.id)"
            class="badge badge--hidden cell__expand"
            :type="7"
            size="medium"
            icon="fullscreen"
            @click="expandedClickHandler(user.id)"
          />
        </div>
      </div>
    </div>

    <call-buttons
      class="bottom-control"
      :buttons="['camera', 'screen', 'speakers', 'microphone', 'leave']"
      size="large"
    />
  </div>
</template>

<script>
import CallButtons from '../CallOverlayWindow/CallButtons';
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import { GRIDS } from './grids';
import { mapGetters } from 'vuex';
import commonStreams from '@classes/commonStreams';

/**
 * Aspect ratio 124 / 168;
 * @type {number}
 */
const ASPECT_RATIO = 0.7380952381;

const PADDING = 20;

export default {
  components: {
    CallButtons,
    UiButton,
    Avatar,
  },
  data() {
    return {
      mounted: false,
      currentGrid: [],
      avatarWidth: null,
      padding: {},
      videoStreams: {},
    };
  },
  computed: {
    ...mapGetters([ 'getUsersWhoShareMedia' ]),
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('call.grid');
    },

    /**
     * Get all grids suitable for current users' count
     * @returns {array}
     */
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
     * Get users' array
     * @returns {array} array of users
     */
    users() {
      return this.$store.getters.getUsersByChannel(this.channelId);
    },

    /**
     * Get users' count
     * @returns {array} array of users
     */
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
  watch: {
    /* re-count grid because number of users has changed */
    usersCount: function () {
      this.resize();
    },

    getUsersWhoShareMedia: {
      deep: true,
      handler(users) {
        this.requestStreams();
      },
    },

    selectedChannel(channelId) {
      if (!channelId) {
        Object.keys(this.videoStreams).forEach(key => {
          this.$delete(this.videoStreams, key);
        });
      }
      if (channelId) {
        this.requestStreams();
      }
    },
  },
  async mounted() {
    this.mounted = true;
    window.addEventListener('resize', this.resize, false); // TODO: add small debounce for performance
    this.resize();
    await new Promise(resolve => this.$nextTick(resolve));
    this.requestStreams();
  },
  destroyed() {
    window.removeEventListener('resize', this.resize, false);
  },
  methods: {
    /**
     * Request not loaded streams and insert loaded
     * @returns {void}
     */
    requestStreams() {
      const users = this.getUsersWhoShareMedia;

      console.log('filter who should be deleted', users, JSON.stringify(this.videoStreams), JSON.stringify(this.users));
      // delete streams that were inserted but users have already stopped sharing
      this.users.filter(u => !u.camera && !u.screen && !!this.videoStreams[u.id]).forEach(u => {
        console.log(`clear stream for ${u.id}`);
        this.$delete(this.videoStreams, u.id);
      });
      Object.keys(this.videoStreams).forEach(uId => {
        if (!this.users.map(u => u.id).includes(uId)) {
          console.log(`clear stream 2 for ${uId}`);
          this.$delete(this.videoStreams, uId);
        }
      });

      console.log('filter who should be added');

      // add streams that were not inserted
      users.filter(id => !this.videoStreams[id]).map(async id => {
        this.$set(this.videoStreams, id, true);
        console.log(`wait stream for ${id}`);
        console.time(`request-${id}`);
        const stream = await commonStreams.getStream(id);

        console.timeEnd(`request-${id}`);

        console.log(`stream received for ${id}`);

        const htmlVideo = this.$refs[`video${id}`][0];

        if (!htmlVideo) {
          console.log('!!!!!!!!!!!!!!!!!!!!!!!!! NOT FOUND');

          return;
        }
        htmlVideo.srcObject = stream;
        htmlVideo.onloadedmetadata = () => {
          htmlVideo.play();
        };
      });
    },

    /**
     * Assign dimentions to the cell depending on its index
     * @param {number} index cell's index
     * @return {object}
     */
    cellDimensions(index) {
      return {
        width: Math.floor(this.avatarWidth * this.currentGrid[index]) + 'px',
        height: Math.floor(this.avatarWidth * ASPECT_RATIO * this.currentGrid[index]) + 'px',
      };
    },

    /**
     * Re-count padding of grid and re-count best grid depending on aspect ratio
     * @return {void}
     */
    resize() {
      const bounds = document.getElementById('cell-grid');

      if (!bounds || !this.grids) {
        return;
      }
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

    /**
     * Find grid with closest aspect ratio to cell-grid's aspect ratio
     * @param {number} val cell-grid's aspect ratio
     * @param {array} arr all grids for current users' amount
     * @return {object}
     */
    findClosest(val, arr) {
      return arr.reduce((a, b) => {
        return Math.abs(b.ratio - val) < Math.abs(a.ratio - val) ? b : a;
      });
    },

    /**
     * If this person has camera/screensharing on. Should we show "fullscreen" button for this person?
     * @param {string} id user's id
     * @returns {boolean}
     */
    isStreaming(id) {
      if (this.getUsersWhoShareMedia.includes(id)) {
        return true;
      }

      return false;
    },

    /**
     * fullscreen click handler
     * @param {string} id user's id
     * @returns {void}
     */
    expandedClickHandler(id) {
      if (!this.isStreaming(id)) {
        return;
      }
      this.$router.push({ path: `/call-window/expanded/${id}` });
    },

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
    padding 24px 30px 24px 40px
    font-weight 500
    font-size 36px
    line-height 42px
    display flex
    flex-direction row
    justify-content space-between
    align-items flex-start

    &__devices
      margin-top 6px

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
      border-radius 4px
      height 100%
      padding 4px
      box-sizing border-box
      display flex
      flex-direction column
      justify-content space-between
      align-items center
      position relative
      overflow hidden

      video
        width 100%
        height 100%
        object-fit cover

    &__feed
      position absolute
      top 0
      left 0
      width 100%
      height 100%
      border-radius 4px
      background: #FFFFFF;

    &__talking
      position absolute
      top 0
      left 0
      width 100%
      height 100%
      border 2px solid var(--color-1)
      border-radius 4px
      box-sizing border-box
      pointer-events none

    &__more
      top 4px
      right 4px
      flex-shrink 0
      opacity 0
      transition opacity 0.15s ease
      position relative

    &__expand
      bottom 4px
      right 4px

    .badge
      position absolute

    .badge--hidden
    .cell__username--hidden
      opacity 0
      transition opacity 0.15s ease

    .cell__inner:hover .badge--hidden
    .cell__inner:hover .cell__username--hidden
      opacity 1

    .badge--hidden.context-menu--opened
      opacity 1

    &__avatar
      border-radius 4px
      overflow hidden
      margin auto

    &__username
      bottom 4px
      margin 0 auto
      background-color var(--app-bg)
      padding 8px
      border-radius 4px
      flex-shrink 0
      max-width calc(100% - 8px)
      box-sizing border-box
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
