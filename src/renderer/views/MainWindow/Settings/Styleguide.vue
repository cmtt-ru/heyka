<template>

  <div>

    <h3 class="l-mt-12">Buttons</h3>

    <div class="l-mt-12">

      <ui-button :type="1" icon="sdf" class="l-mr-8">Create channel</ui-button>

      <ui-button size="small" :type="1" icon="sdf">Apply</ui-button>

    </div>

  </div>

</template>

<script>

import UiButton from '@components/UiButton';

export default {
  components: {
    UiButton,
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
