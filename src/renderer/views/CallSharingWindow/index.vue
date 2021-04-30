<template>
  <div
    class="layout__popover"
  >
    <router-view />
  </div>
</template>

<style scoped lang="stylus">
    .layout__popover
        -webkit-app-region drag
        background-color var(--new-black)
</style>
