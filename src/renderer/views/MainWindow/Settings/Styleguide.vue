<template>

  <div>

    <h3 class="l-mt-12">Buttons</h3>

    <div class="l-mt-12">

      <ui-button :type="1" class="l-mr-8">Create channel</ui-button>

      <ui-button :type="2" class="l-mr-8">Create channel</ui-button>

      <ui-button :type="3" class="l-mr-8">Create channel</ui-button>

    </div>

    <div class="l-mt-12">

      <ui-button :type="4" class="l-mr-8">Create channel</ui-button>

      <ui-button :type="5" class="l-mr-8">Create channel</ui-button>

      <ui-button :type="6" class="l-mr-8">Create channel</ui-button>

    </div>

    <div class="l-mt-12">

      <ui-button :type="1" icon="headphones" class="l-mr-8">Create channel</ui-button>

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
