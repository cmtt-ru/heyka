<template>
  <div class="call-window">
    <div
      v-if="isMediaSharing"
      class="call-window__media"
      @dblclick="expandHandler"
    >
      <video ref="video" />

      <ui-button
        class="call-window__media__expand"
        :type="7"
        size="medium"
        icon="fullscreen"
        @click="expandHandler"
      />
    </div>

    <call-controls
      :row="isMediaSharing"
      :buttons="['screen', 'camera', 'microphone', 'grid', 'leave']"
    />
  </div>
</template>

<script>
import CallControls from './CallControls';
import { mapGetters, mapState } from 'vuex';
import broadcastActions from '@classes/broadcastActions';
import broadcastEvents from '@classes/broadcastEvents';
import UiButton from '@components/UiButton';
import janusVideoroomWrapper from '../../classes/janusVideoroomWrapper';

export default {
  components: {
    CallControls,
    UiButton,
  },
  data() {
    return {
      watchingUser: null,
    };
  },
  computed: {
    ...mapState({
      janusOptions: 'janus',
      selectedDevices: 'app/selectedDevices',
    }),
    ...mapGetters({
      getUserWhoSharesMedia: 'getUserWhoSharesMedia',
      getUsersWhoShareMedia: 'getUsersWhoShareMedia',
      amISharingMedia: 'amISharingMedia',
      isAnybodySharingMedia: 'isAnybodySharingMedia',
      getSpeakingUser: 'getSpeakingUser',
      mediaState: 'me/getMediaState',
      selectedChannelId: 'me/getSelectedChannelId',
      myId: 'me/getMyId',
    }),

    isMediaSharing() {
      return this.isAnybodySharingMedia && !this.amISharingMedia;
    },

    getSpeakingUserId() {
      if (this.getSpeakingUser) {
        return this.getSpeakingUser.id;
      }

      return false;
    },
  },

  watch: {
    isMediaSharing() {
      broadcastActions.dispatch('me/setMediaSharingMode', this.isMediaSharing);
    },

    selectedChannelId(newChannelId, oldChannelId) {
      if (!newChannelId && oldChannelId) {
        janusVideoroomWrapper.leave();
      }
      if (newChannelId) {
        janusVideoroomWrapper.join(this.myId, this.janusOptions);
      }
    },

    getSpeakingUserId(newUserId) {
      const activePublishers = janusVideoroomWrapper.getActivePublishers();

      if (activePublishers.find(publisher => publisher.userId === newUserId)) {
        this.watchingUser = newUserId;
      }
    },

    watchingUser(newUser, oldUser) {
      if (newUser && oldUser) {
        const publisher = janusVideoroomWrapper.getActivePublishers().find(p => p.userId === newUser);

        if (!publisher) {
          console.log('switch user but not exist');

          return;
        }
        janusVideoroomWrapper.switchSingleSubscription(publisher.janusId);
      } else if (newUser && !oldUser) {
        const publisher = janusVideoroomWrapper.getActivePublishers().find(p => p.userId === newUser);

        if (!publisher) {
          console.log('new user but not exist');

          return;
        }
        janusVideoroomWrapper.createSingleSubscription(publisher.janusId);
      } else if (!newUser && oldUser) {
        console.log('remove subs');
        janusVideoroomWrapper.removeSingleSubscription();
      }
    },
  },

  async created() {
    if (this.isMediaSharing) {
      broadcastActions.dispatch('me/setMediaSharingMode', this.isMediaSharing);
    }
    await janusVideoroomWrapper.init();
    if (this.selectedChannelId) {
      await janusVideoroomWrapper.join(this.myId, this.janusOptions);
    }
  },
  mounted() {
    if (this.getUserWhoSharesMedia) {
      this.watchingUser = this.getUserWhoSharesMedia;
    }
    janusVideoroomWrapper.on('single-sub-stream', stream => {
      this.insertStream(stream);
    });
    janusVideoroomWrapper.on('publisher-joined', publisher => {
      if (publisher.userId === this.watchingUser) {
        janusVideoroomWrapper.createSingleSubscription(publisher.janusId);
      }
    });
  },
  beforeDestroy() {
    this.watchingUser = null;
    janusVideoroomWrapper.removeAllListeners('single-sub-stream');
    janusVideoroomWrapper.removeAllListeners('publisher-joined');
  },
  destroyed() {

  },
  methods: {

    /**
     * Show grid handler
     * @returns {void}
     */
    showGridHandler() {
      broadcastActions.dispatch('openGrid');
      broadcastEvents.dispatch('grid');
    },

    /**
     * Expand click handler
     * @returns {void}
     */
    expandHandler() {
      if (this.getUserWhoSharesMedia) {
        broadcastActions.dispatch('openGrid');
        broadcastEvents.dispatch('grid-expand', this.getSpeakingUserId);
      }
    },

    /**
     * Insert video stream in html
     * @param {MediaStream} stream Video stream
     * @returns {void}
     */
    insertStream(stream) {
      const el = this.$refs.video;

      el.srcObject = stream;
      el.onloadedmetadata = () => {
        el.play();
      };
    },
  },
};
</script>

<style lang="stylus" scoped>
  .call-window
    display flex
    flex-direction column

    &__media
      position relative
      flex-grow 1

      video
        display block
        width 100%
        height 213px
        object-fit cover

      &__expand
        position absolute
        bottom 8px
        right 8px
        transition opacity 0.15s ease
        opacity 0

    &:hover
      .call-window__media__expand
        opacity 1

</style>
