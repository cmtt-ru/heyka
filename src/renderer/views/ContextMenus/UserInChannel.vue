<template>
  <popover>
    <div class="buttons">
      <router-link :to="{ name: 'user', params: { id: userId }}">
        <ui-button
          :type="11"
          propagation
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
        v-if="notMe"
        :type="11"
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
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('popover.userInChannel');
    },

    notMe() {
      return (this.$store.state.me.id !== this.userId);
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
          channel: this.$store.getters['me/getSelectedChannelId'],
        },
      });
    },

    /**
     * Mute click handler
     * @returns {void}
     */
    muteClickHandler() {
      console.log('mute user', this.userId);
      this._notImplemented();
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
