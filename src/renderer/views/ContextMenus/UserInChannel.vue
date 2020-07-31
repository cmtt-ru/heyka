<template>
  <popover>
    <div class="buttons">
      <router-link :to="{ name: 'user', params: { id: userId }}">
        <ui-button
          :type="11"
        >
          {{ texts.profile }}
        </ui-button>
      </router-link>
      <ui-button
        v-if="notMe"
        :type="11"
        data-popover-close
        @click="pokeClickHandler"
      >
        {{ texts.poke }}
      </ui-button>
      <ui-button
        v-if="notMe && microphone && amIInChannel"
        :type="11"
        data-popover-close
        @click="muteClickHandler"
      >
        {{ texts.mute }}
      </ui-button>
    </div>
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import UiButton from '@components/UiButton';

export default {
  components: {
    Popover,
    UiButton,
  },

  props: {
    /**
     * User id
     */
    userId: {
      type: String,
      default: '',
    },

    /**
     * User microphone state
     */
    microphone: {
      type: Boolean,
      default: false,
    },

    /**
     * Channel id
     */
    channelId: {
      type: String,
      default: null,
    },
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('popover.userInChannel');
    },

    /**
     * Not me
     * @returns {boolean}
     */
    notMe() {
      return (this.$store.state.me.id !== this.userId);
    },

    /**
     * Am i in channel
     * @returns {boolean}
     */
    amIInChannel() {
      return this.$store.getters['me/getSelectedChannelId'] === this.channelId;
    },
  },

  methods: {
    /**
     * Poke click handler
     * @returns {void}
     */
    async pokeClickHandler() {
      await this.$store.dispatch('app/sendPush', {
        userId: this.userId,
        isResponseNeeded: true,
        message: {
          action: 'invite',
          channelId: this.$store.getters['me/getSelectedChannelId'],
        },
      });
    },

    /**
     * Mute click handler
     * @returns {void}
     */
    muteClickHandler() {
      this.$store.dispatch('users/muteForAll', this.userId);
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
