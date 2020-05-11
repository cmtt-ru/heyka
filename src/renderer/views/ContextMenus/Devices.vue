<template>
  <popover>
    <devices/>
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import Devices from '@views/MainWindow/Settings/Devices';

export default {
  components: {
    Popover,
    Devices,
  },

  props: {
    userId: String,
  },

  methods: {
    /**
     * Poke click handler
     * @returns {void}
     */
    pokeClickHandler() {
      console.log('poke to user', this.userId);
    },

    /**
     * Mute click handler
     * @returns {void}
     */
    muteClickHandler() {
      console.log('mute user', this.userId);
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
