<template>

    <layout>

      <template v-slot:sidebar-header>
        Settings
      </template>

      <template v-slot:sidebar-body>
        <router-link to="">General</router-link>
        <br>
        <router-link to="">Devices</router-link>
        <br>
        <router-link to="">Network</router-link>
        <br>
        <router-link to="">About</router-link>
        <br>
        <router-link to="">Support</router-link>
      </template>

      <template v-slot:content-body>
        <router-link :to="{name: 'workspace'}">Close</router-link>
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
