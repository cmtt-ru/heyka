<template>
  <div>
    <tabs>
      <tab
        selected
        name="First"
      >
        First tab content
      </tab>
      <tab name="Second">
        Second tab content
      </tab>
      <tab name="Third">
        Third tab content
      </tab>
    </tabs>
  </div>
</template>

<script>

import { Tabs, Tab } from '@components/Tabs';

export default {
  components: {
    Tabs,
    Tab,
  },
  data() {
    return {

    };
  },

  created() {

  },
  methods: {
    selectItem(data) {
      this.selectedArray = data;
    },
  },
};
</script>

<style scoped lang="stylus">

</style>
