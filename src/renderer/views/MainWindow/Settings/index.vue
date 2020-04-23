<template>

    <layout>

      <template v-slot:sidebar-header>
        <div class="l-p-8 l-fw-m">
          Settings
        </div>
      </template>

      <template v-slot:sidebar-body>
        <div class="l-p-8">
          <router-link to="">General</router-link>
          <br>
          <router-link to="">Devices</router-link>
          <br>
          <router-link to="">Network</router-link>
          <br>
          <router-link to="">About</router-link>
          <br>
          <router-link to="">Support</router-link>
          <br>
          <router-link :to="{name: 'styleguide'}">Styleguide</router-link>
        </div>
      </template>

      <template v-slot:content-body>
        <div class="l-p-8">
          <router-link :to="{name: 'workspace'}">Close</router-link>
          <router-view></router-view>
        </div>
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
