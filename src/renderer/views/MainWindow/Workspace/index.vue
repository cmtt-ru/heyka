<template>

    <layout>

      <template v-slot:sidebar-header>
        sidebar-header
      </template>

      <template v-slot:sidebar-body>
        <router-link :to="{ name: 'settings'}">Settings</router-link>
      </template>

      <template v-slot:content-header>
        content-header
      </template>

      <template v-slot:content-body>
        <router-view></router-view>
      </template>

    </layout>

</template>

<script>
import Layout from './../Layout';

export default {
  components: {
    Layout,
  },
  data() {
    return {

    };
  },
  created() {

  },
};
</script>

<style scoped lang="stylus">

</style>
