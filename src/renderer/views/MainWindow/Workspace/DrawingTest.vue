<template>
  <div>
    <tablet
      color="#DE4B39"
      :aspect-ratio="0.5625"
      my-id="dce5e5d0-4f9f-4262-8df4-c982cd057ad8"
      @data="sendData"
    />
    <tablet
      color="#1ebf1b"
      :aspect-ratio="0.5625"
      my-id="03bce5c6-6871-45e2-93c0-ed6f7213cbb4"
      @data="sendData"
    />
    <div class="screen-imitation">
      <board-holder
        :data="newDots"
      />
    </div>
  </div>
</template>

<script>
import Tablet from '@components/Drawing/Tablet';
import BoardHolder from '@components/Drawing/BoardHolder';

export default {
  components: {
    Tablet,
    BoardHolder,
  },
  data() {
    return {
      newDots: {},
    };
  },
  mounted() {
    // console.log(this.$store.getters['users/getAllUsers']);
  },
  methods: {
    sendData(val) { // TODO: toggle API here
      this.newDots = val;
    },
  },
};
</script>
<style scoped lang="stylus">
.screen-imitation
  width 600px
  height 337.5px
</style>
