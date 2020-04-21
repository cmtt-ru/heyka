<template>
  <popover>
    <ui-button :type="11">Open profile</ui-button>
    <ui-button :type="11" @click="pokeClickHandler">Poke</ui-button>
    <ui-button :type="11">Mute for all</ui-button>
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
    userId: String,
  },

  computed: {

  },

  methods: {
    pokeClickHandler() {
      console.log(this.userId);
    },
  },

  mounted() {
  },
};
</script>

<style lang="stylus">

</style>
