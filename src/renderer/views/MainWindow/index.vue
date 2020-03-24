<template>
<div>
    <div>Main wrapper</div>
    <router-view></router-view>
</div>
</template>

<script>
import DeepLinkRenderer from '@shared/DeepLink/DeepLinkRenderer';

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
  },
};
</script>

<style scoped lang="stylus">

</style>