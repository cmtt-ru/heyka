<template>
  <layout>
    <template #sidebar-body>
      <sidebar />
    </template>

    <template #content-body>
      <router-view />
    </template>

    <!-- <performance-monitor /> -->
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
};
</script>
