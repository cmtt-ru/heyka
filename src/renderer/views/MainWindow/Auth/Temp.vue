<template>
  <layout>

    <template v-slot:sidebar-body>
      <img width="100%" src="https://leonardo.osnova.io/0658b525-8db3-fe95-69bd-fd64537802c6/">
    </template>

    <template v-slot:content-body>
      <div class="l-p-18">
        <p class="l-fs-18">Welcome to heyka</p>
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
  mounted() {

  },
};
</script>

<style scoped lang="stylus">

</style>
