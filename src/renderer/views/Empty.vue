<template>
  <div>
    <a @click.prevent="$router.go(-1)">Back</a>
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
