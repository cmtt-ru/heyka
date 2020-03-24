<template>
  <div>
    <div>
      <layout>

        <template v-slot:sidebar-header>
          sidebar-header
        </template>

        <template v-slot:sidebar-body>
          sidebar-body
        </template>

        <template v-slot:content-header>
          content-header
        </template>

        <template v-slot:content-body>
          <router-view></router-view>
        </template>

      </layout>

    </div>
  </div>
</template>

<script>
import DeepLinkRenderer from '@shared/DeepLink/DeepLinkRenderer';
import Layout from './Layout';

export default {
  components: {
    Layout,
  },
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
