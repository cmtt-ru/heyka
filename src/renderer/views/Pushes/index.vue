<template>
  <div
    :style="$themes.getColors('navbar')"
    class="push-wrapper"
  >
    <push
      v-for="push in pushes"
      :id="push.inviteId"
      :key="push.inviteId"
      :lifespan="push.lifespan"
      :data="push"
      @close="closeHandler"
      @response="responseHandler"
    />
  </div>
</template>

<script>
import Push from './Push';
import broadcastActions from '@classes/broadcastActions';
import broadcastEvents from '@classes/broadcastEvents';

export default {
  components: {
    Push,
  },
  computed: {
    /**
     * Get all pushes from store
     *
     * @returns {array}
    */
    pushes() {
      return this.$store.state.app.pushes;
    },
  },
  methods: {
    /**
     * Close push by its id
     *
     * @param {string} id id
     * @returns {void}
    */
    closeHandler(id) {
      broadcastActions.dispatch('app/removePush', id);
    },

    /**
     * Send response action
     *
     * @param {string} id id
     * @returns {void}
    */
    async responseHandler({ response, inviteId, data }) {
      switch (response.action) {
        case 'accept-invite':
          await broadcastActions.dispatch('selectChannel', data.channelId);
          await broadcastEvents.dispatch('open-channel', data.channelId);
          await broadcastActions.dispatch('app/sendPushResponse', {
            response,
            inviteId,
          });
          break;
        case 'turn-mic-on':
          broadcastActions.dispatch('me/microphoneState', true);
          break;
        default:
          await broadcastActions.dispatch('app/sendPushResponse', {
            response,
            inviteId,
          });
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.push-wrapper
    width 100vw
    padding-top 12px
    overflow hidden
    display flex
    flex-direction column-reverse
    justify-content flex-start
    align-items center
    background-color transparent
</style>
