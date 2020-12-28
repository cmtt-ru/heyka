<template>
  <div
    id="push-wrapper"
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
import broadcastActions from '@sdk/classes/broadcastActions';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';

const NO_MOUSE_EVENTS_TIMEOUT = 150;
const pushWindow = WindowManager.getCurrentWindow();

let ignoreMouseTimeout;
let ignoreMouse = false;

export default {
  components: {
    Push,
  },
  data() {
    return {

    };
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

  created() {
    if (IS_LINUX) {
      // linux logic
    } else {
      window.addEventListener('mousemove', event => {
        console.count('mousemove');
        if (event.target === document.documentElement || event.target === document.getElementById('push-wrapper')) {
          if (ignoreMouse === true) {
            return;
          }

          pushWindow.api('setIgnoreMouseEvents', true, { forward: true });
          ignoreMouse = true;

          if (ignoreMouseTimeout) {
            clearTimeout(ignoreMouseTimeout);
          }

          ignoreMouseTimeout = setTimeout(function () {
            pushWindow.api('focus');
          }, NO_MOUSE_EVENTS_TIMEOUT);
        } else {
          if (ignoreMouse === false) {
            return;
          }
          pushWindow.api('setIgnoreMouseEvents', false);
          ignoreMouse = false;
        }
      });
    }
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
          await broadcastActions.dispatch('selectChannelInAnotherWorkspace', {
            workspaceId: data.workspaceId,
            channelId: data.channelId,
          });
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

<style lang="stylus">
body, html
  height 100%

body
  pointer-events none

*
  pointer-events auto
</style>

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
