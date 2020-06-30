<template>
  <div>
    <a @click.prevent="$router.go(-1)">Back</a>
    <router-link :to="{name: 'workspace'}">Workspace</router-link>
    <router-link :to="{name: 'settings'}">Settings</router-link>
    <performance-monitor></performance-monitor>
  </div>
</template>

<script>
import PerformanceMonitor from '@components/PerformanceMonitor';

export default {
  components: {
    PerformanceMonitor,
  },
};
</script>

<style lang="stylus">

</style>
