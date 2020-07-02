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
        v-popover.click="{name: 'Devices'}"
        class="top-content__devices"
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
            :class="{ 'cell__feed--flip': user.camera && user.id === myId }"
          />
          <div
            v-show="user.speaking && user.microphone"
            class="cell__talking"
          />

          <ui-button
            :key="isStreaming(user.id)"
            v-popover.click="{name: 'GridUser', data: {userId: user.id, isStreaming: isStreaming(user.id)}}"
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

          <!-- <ui-button
            v-if="isStreaming(user.id)"
            class="badge badge--hidden cell__expand"
            :type="7"
            size="medium"
            icon="fullscreen"
            @click="expandedClickHandler(user.id)"
          /> -->
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
import broadcastEvents from '@classes/broadcastEvents';
import janusVideoroomWrapper from '../../classes/janusVideoroomWrapper';
import Logger from '@classes/logger';
const cnsl = new Logger('Grid.vue', '#138D75');

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
    ...mapGetters({
      getUsersWhoShareMedia: 'getUsersWhoShareMedia',
      mediaState: 'me/getMediaState',
      myId: 'me/getMyId',
      channelId: 'me/getSelectedChannelId',
      selectedChannel: 'myChannel',
      users: 'usersInMyChannel',
    }),

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
      return this.selectedChannel?.name || 'no channel selected';
    },

  },

  watch: {
    /* re-count grid because number of users has changed */
    usersCount: function () {
      this.resize();
    },
    selectedChannel(channelId) {
      if (!channelId) {
        Object.keys(this.videoStreams).forEach(key => {
          this.$delete(this.videoStreams, key);
        });
      }
    },
  },

  async mounted() {
    this.mounted = true;
    window.addEventListener('resize', this.resize, false); // TODO: add small debounce for performance
    this.resize();

    broadcastEvents.on('grid-expand', (userId) => {
      this.expandedClickHandler(userId);
    });

    // Send command to subscribe for all video publishers
    this.handleVideoStreams();

    janusVideoroomWrapper.on('publisher-joined', async publisher => {
      janusVideoroomWrapper.subscribeFor(publisher.janusId);
    });

    janusVideoroomWrapper.on('publisher-left', userId => {
      this.$delete(this.videoStreams, userId);
    });

    janusVideoroomWrapper.on('new-stream', async publisher => {
      cnsl.log('new stream for publisher: ', publisher);
      if (!this.getUsersWhoShareMedia.includes(publisher.userId)) {
        cnsl.log('wait for publisher is appear');
        await this.waitForPublisherWillAppear(publisher.userId);
      }
      this.insertVideoStreamForUser(publisher.userId, publisher.stream);
    });
  },

  beforeDestroy() {
    janusVideoroomWrapper.removeAllListeners('publisher-joined');
    janusVideoroomWrapper.removeAllListeners('publisher-left');
    janusVideoroomWrapper.removeAllListeners('new-stream');
  },

  destroyed() {
    window.removeEventListener('resize', this.resize, false);
    broadcastEvents.removeAllListeners('grid-expand');
  },

  methods: {
    /**
     * Handle video streams in this room
     * Insert existed videos, request videos that arent receiving now,
     * insert local video stream
     * @returns {void}
     */
    handleVideoStreams() {
      // unpause all streams
      janusVideoroomWrapper.resumeAllSubscriptions();

      // insert existing videos
      const activePublishers = janusVideoroomWrapper.getActivePublishers();

      activePublishers
        .filter(publisher => publisher.stream)
        .forEach(publisher => {
          cnsl.log('insert video for user ', publisher.userId, publisher.stream);
          this.insertVideoStreamForUser(publisher.userId, publisher.stream);
        });

      // start publishers without streams
      activePublishers
        .filter(publisher => !publisher.stream)
        .forEach(publisher => {
          cnsl.log('subscribe for video from user', publisher.userId);
          janusVideoroomWrapper.subscribeFor(publisher.janusId);
        });
    },
    /**
     * Insert stream in HTML5 video tag
     * @param {string} userId User id
     * @param {MediaStream} stream User video stream
     * @returns {void}
     */
    async insertVideoStreamForUser(userId, stream) {
      this.$set(this.videoStreams, userId, true);
      await new Promise(resolve => this.$nextTick(resolve));

      const htmlVideo = this.$refs[`video${userId}`][0];

      if (!htmlVideo) {
        cnsl.error(`Not found HTML video tag for user ${userId}`);

        return;
      }
      htmlVideo.srcObject = stream;
      htmlVideo.onloadedmetadata = () => {
        htmlVideo.play();
      };
    },

    async waitForPublisherWillAppear(userId) {
      const maxAttempts = 5;
      const interval = 100;

      let i = 0;

      while (i++ < maxAttempts) {
        if (this.getUsersWhoShareMedia.includes(userId)) {
          return;
        }
        await new Promise(resolve => setInterval(resolve, interval));
      }
      throw new Error('WaitPublisherTimeout');
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
        // here we imply that A is always smaller than B (our case)
        return val < Math.sqrt(a.ratio * b.ratio) ? a : b;
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
      if (!this.isStreaming(id) || id === this.myId) {
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

      &--flip
        transform: scaleX(-1)

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
