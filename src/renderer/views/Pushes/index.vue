<template>
  <div
    :style="$themes.getColors('navbar')"
    class="push-wrapper"
  >
    <push
      v-for="push in pushes"
      :id="push.id"
      :key="push.id"
      :lifespan="push.lifespan"
      :data="push.data"
      @close="closeHandler"
    />
  </div>
</template>

<script>
import Push from './Push';
import broadcastActions from '@classes/broadcastActions';

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
      return this.$store.getters['app/getPushes'];
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

<style lang="stylus">
  html
    overflow hidden
</style>