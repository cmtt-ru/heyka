<template>
  <layout>
    <template #sidebar-header>
      <performance-monitor />
      <sidebar-header />
    </template>

    <template #sidebar-body>
      <sidebar />
    </template>

    <template #content-body>
      <router-view />
    </template>
  </layout>
</template>

<script>
import Layout from './../Layout';
import Sidebar from './Sidebar';
import SidebarHeader from './SidebarHeader';
import PerformanceMonitor from '@components/PerformanceMonitor';

export default {
  components: {
    Layout,
    Sidebar,
    SidebarHeader,
    PerformanceMonitor,
  },
  data() {
    return {

    };
  },
};
</script>

<style scoped lang="stylus">

</style>
