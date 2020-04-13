<template>
  <router-view></router-view>
</template>

<script>
import DeepLinkRenderer from '@shared/DeepLink/DeepLinkRenderer';
import * as sockets from '@api/socket';

export default {
  data() {
    return {
      deepLink: {},
    };
  },

  async created() {
    this.deepLink = new DeepLinkRenderer({
      invite: 'main-window/signinbylink',
      login: 'main-window/login',
      join: 'main-window/workspace',
      call: 'main-window/workspace',
      d: 'main-window/workspace',
    });

    await this.$store.dispatch('initial');
    await sockets.init();
  },

  destroyed() {
    sockets.destroy();
    console.error('Ой-ёй! Кажется такого не должно быть');
  },
};
</script>

<style scoped lang="stylus">

</style>
