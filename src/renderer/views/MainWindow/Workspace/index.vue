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
// import PerformanceMonitor from '@components/PerformanceMonitor';

export default {
  components: {
    Layout,
    Sidebar,
    // PerformanceMonitor,
  },
  data() {
    return {

    };
  },
};
</script>
