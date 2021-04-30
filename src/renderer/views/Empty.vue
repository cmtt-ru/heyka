<template>
  <div>
    <a @click.prevent="__backOrRedirect()">Back</a>
    <router-link :to="{name: 'workspace'}">
      Workspace
    </router-link>
    <router-link :to="{name: 'settings'}">
      Settings
    </router-link>
  </div>
</template>

<script>
export default {
  components: {
  },
};
</script>

<style lang="stylus">

</style>
