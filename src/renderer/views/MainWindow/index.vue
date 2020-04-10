<template>
  <router-view></router-view>
</template>

<script>
import DeepLinkRenderer from '@shared/DeepLink/DeepLinkRenderer';
import '@api/socket';

export default {
  data() {
    return {
      deepLink: {},
    };
  },
  created() {
    this.deepLink = new DeepLinkRenderer({
      invite: 'main-window/signinbylink',
      login: 'main-window/login',
      join: 'main-window/workspace',
      call: 'main-window/workspace',
      d: 'main-window/workspace',
    });

    this.$store.dispatch('initial');
  },
};
</script>
<style scoped lang="stylus">

</style>
