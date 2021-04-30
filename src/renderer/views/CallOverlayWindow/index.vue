<template>
  <div
    class="layout__popover"
  >
    <router-view />
  </div>
</template>

<script>
import janusVideoroomWrapper from '@sdk/classes/janusVideoroomWrapper';
export default {
  mounted() {
    window.addEventListener('beforeunload', function (e) {
      janusVideoroomWrapper.leave();
    });
  },
};
</script>

<style scoped lang="stylus">
    .layout__popover
        -webkit-app-region drag
        background-color var(--new-black)
</style>
