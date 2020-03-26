<template>

    <layout>

      <template v-slot:sidebar-header>
        <div class="l-p-8 l-w-m">
          Yandex.Taxi
        </div>
      </template>

      <template v-slot:sidebar-body>
        <div class="l-p-8">
          <router-link :to="{ name: 'settings'}">Settings</router-link>
        </div>
      </template>

      <template v-slot:content-header>
        <div class="l-p-8">
          content-header
        </div>
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
