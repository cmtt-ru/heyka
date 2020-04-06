<template>

    <layout>

      <template v-slot:sidebar-header>
        <div class="l-p-8 l-w-m">
          <router-link :to="{ name: 'settings'}">Settings</router-link>
        </div>
      </template>

      <template v-slot:sidebar-body>
          <sidebar/>
      </template>

      <template v-slot:content-header>
        <div class="l-p-8">
          content-header
        </div>
      </template>

      <template v-slot:content-body>
        <router-view/>
      </template>

    </layout>

</template>

<script>
import Layout from './../Layout';
import Sidebar from './Sidebar';

export default {
  components: {
    Layout,
    Sidebar,
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
