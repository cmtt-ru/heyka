<template>
  <!--
    * Styleguide for testing UI components
  -->
  <div>

    <h2 class="l-mt-24">Buttons</h2>

    <h3 class="l-mt-24">Small</h3>

    <div class="l-mt-12">

      <ui-button :type="1" size="small" class="l-mr-8">Create channel</ui-button>

      <ui-button :type="2" size="small" class="l-mr-8">Create channel</ui-button>

      <ui-button :type="3" size="small" class="l-mr-8">Create channel</ui-button>

    </div>

    <h3 class="l-mt-24">Medium</h3>

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

    <h3 class="l-mt-24">Wide</h3>
    <div class="l-mt-12" style="width: 260px">
      <ui-button :type="6" icon="headphones" :wide="true" class="l-mr-8">
        Facebook
        <svg-icon
          name="headphones"
          :size="12"
          slot="right"
        ></svg-icon>
      </ui-button>
    </div>

    <div class="l-mt-12" style="width: 260px">
      <ui-button :type="3" :wide="true" class="l-mr-8">
        Facebook
      </ui-button>
    </div>

    <h3 class="l-mt-24">Icon only</h3>
    <div class="l-mt-12">
      <ui-button :type="7" size="small" icon="headphones" class="l-mr-8"></ui-button>
      <ui-button :type="7" size="medium" icon="headphones" class="l-mr-8"></ui-button>
      <ui-button :type="7" size="large" icon="headphones" class="l-mr-8"></ui-button>
    </div>

    <div class="l-mt-12" style="background: #000; margin: 0 -8px 0 -8px; padding: 18px 8px">
      <div :style="$themes.getColors('popover')">

        <h3>Icon in popover</h3>
        <div class="l-mt-12 l-mb-24">
          <ui-button :type="7" size="small" icon="headphones" class="l-mr-8"></ui-button>
          <ui-button :type="7" size="medium" icon="headphones" class="l-mr-8"></ui-button>
          <ui-button :type="7" size="large" icon="headphones" class="l-mr-8"></ui-button>
        </div>

        <h3>Transparent button</h3>
        <div class="l-mt-12">
          <ui-button :type="8" size="small">Cancel</ui-button>
          <ui-button :type="8" size="small">Apply</ui-button>
        </div>

      </div>
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
  h3
    color var(--text-0)
</style>
