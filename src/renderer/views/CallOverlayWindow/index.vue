<template>
  <div
    class="layout__popover"
    :style="$themes.getColors('popover')"
  >
    <router-view />
  </div>
</template>

<script>
import janusVideoroomWrapper from '@sdk/classes/janusVideoroomWrapper';
export default {
  mounted() {
    window.addEventListener('beforeunload', function (e) {
      janusVideoroomWrapper._disconnect();
    });
  },
};
</script>

<style scoped lang="stylus">
    .layout__popover
        -webkit-app-region drag
        background-color var(--app-bg)
        color var(--text-0)
</style>
