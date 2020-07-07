<template>
  <div
    class="layout__popover"
    :style="$themes.getColors('popover')"
  >
    <router-view />
  </div>
</template>

<style scoped lang="stylus">
    .layout__popover
        -webkit-app-region drag
        background-color var(--app-bg)
        color var(--text-0)
</style>
