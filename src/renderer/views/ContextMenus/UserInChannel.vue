<template>
  <popover>
    <router-link :to="{ name: 'user', params: { id: userId }}">
      <ui-button :type="11">Open profile</ui-button>
    </router-link>
    <ui-button :type="11" @click="pokeClickHandler">Poke</ui-button>
    <ui-button :type="11" @click="muteClickHandler">Mute for all</ui-button>
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
      console.log('poke to user', this.userId);
    },

    muteClickHandler() {
      console.log('mute user', this.userId);
    },
  },

  mounted() {
  },
};
</script>

<style lang="stylus" scoped>
  a
    .ui-button
      width 100%
</style>
