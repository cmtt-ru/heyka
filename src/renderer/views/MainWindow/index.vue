<template>
  <router-view></router-view>
</template>

<script>
import DeepLinkRenderer from '@shared/DeepLink/DeepLinkRenderer';

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

    console.log(this.$store.getters['channels/getChannels']);
  },
};
</script>
<style scoped lang="stylus">

</style>
