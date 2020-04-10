<template>

    <layout>

      <template v-slot:sidebar-header>
        <sidebar-header/>
      </template>

      <template v-slot:sidebar-body>
          <sidebar/>
      </template>

      <template v-slot:content-header>
         <workspace-header/>
      </template>

      <template v-slot:content-body>
        <router-view/>
      </template>

    </layout>

</template>

<script>
import Layout from './../Layout';
import Sidebar from './Sidebar';
import SidebarHeader from './SidebarHeader';
import WorkspaceHeader from './WorkspaceHeader';

export default {
  components: {
    Layout,
    Sidebar,
    SidebarHeader,
    WorkspaceHeader,
  },
  data() {
    return {

    };
  },
};
</script>

<style scoped lang="stylus">

</style>
