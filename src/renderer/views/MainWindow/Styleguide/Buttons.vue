<template>
  <div>
    <h1 class="l-mt-12">
      Buttons
    </h1>

    <h3 class="l-mt-24">
      Small
    </h3>

    <div class="l-mt-12">
      <ui-button
        :type="1"
        size="small"
        class="l-mr-8"
      >
        Type --1
      </ui-button>

      <ui-button
        :type="2"
        size="small"
        class="l-mr-8"
      >
        Type --2
      </ui-button>

      <ui-button
        :type="3"
        size="small"
        class="l-mr-8"
      >
        Type --3
      </ui-button>

      <ui-button
        :type="12"
        size="small"
        class="l-mr-8"
      >
        Type --12
      </ui-button>
    </div>

    <h3 class="l-mt-24">
      Medium
    </h3>

    <div class="l-mt-12">
      <ui-button
        :type="1"
        class="l-mr-8"
      >
        Type --1
      </ui-button>

      <ui-button
        :type="2"
        class="l-mr-8"
      >
        Type --2
      </ui-button>

      <ui-button
        :type="3"
        class="l-mr-8"
      >
        Type --3
      </ui-button>

      <ui-button
        :type="11"
        class="l-mr-8"
      >
        Type --11
      </ui-button>
    </div>

    <div class="l-mt-12">
      <ui-button
        :type="4"
        class="l-mr-8"
      >
        Type --4
      </ui-button>

      <ui-button
        :type="5"
        class="l-mr-8"
      >
        Type --5
      </ui-button>

      <!-- <ui-button
        :type="6"
        class="l-mr-8"
      >
        Type --6
      </ui-button> -->
    </div>

    <h3 class="l-mt-24">
      Wide
    </h3>
    <!-- <div
      class="l-mt-12"
      style="width: 260px"
    >
      <ui-button
        :type="6"
        icon="headphones"
        wide
        class="l-mr-8"
      >
        Type --6
        <svg-icon
          slot="right"
          name="headphones"
          size="small"
        />
      </ui-button>
    </div> -->

    <div
      class="l-mt-12"
      style="width: 260px"
    >
      <ui-button
        :type="3"
        :wide="true"
        class="l-mr-8"
      >
        Type --3
      </ui-button>
    </div>

    <h3 class="l-mt-24">
      With icon
    </h3>
    <div class="l-mt-12">
      <ui-button
        :type="9"
        icon="headphones"
        class="l-mr-8"
      >
        Type --9
      </ui-button>
    </div>
    <div class="l-mt-12">
      <ui-button
        :type="10"
        icon="headphones"
        class="l-mr-8"
      >
        Type --10
      </ui-button>
    </div>

    <ui-button
      :type="11"
      icon="headphones"
      class="l-mr-8"
    >
      Type --11
    </ui-button>

    <div>
      <ui-button
        :type="14"
        class="l-mr-8"
      >
        Type --14
      </ui-button>
    </div>

    <div>
      <ui-button
        :type="15"
        :active="true"
      >
        Type --15
      </ui-button>
      <ui-button
        :type="15"
      >
        Type --15
      </ui-button>
      <ui-button
        :type="15"
      >
        Type --15
      </ui-button>
    </div>

    <h3 class="l-mt-24">
      Icon only, type --7
    </h3>
    <div class="l-mt-12">
      <ui-button
        :type="7"
        size="small"
        icon="headphones"
        class="l-mr-8"
      />
      <ui-button
        :type="7"
        size="medium"
        icon="headphones"
        class="l-mr-8"
      />
      <ui-button
        :type="7"
        size="large"
        icon="headphones"
        class="l-mr-8"
      />
    </div>

    <div
      class="l-mt-12"
      style="background: #000; margin: 0 -8px 0 -8px; padding: 18px 8px"
    >
      <div
        style="color: var(-new-UI-09)"
      >
        <h3>Icon in popover</h3>
        <div class="l-mt-12 l-mb-24">
          <ui-button
            :type="7"
            size="small"
            icon="headphones"
            class="l-mr-8"
          />
          <ui-button
            :type="7"
            size="medium"
            icon="headphones"
            class="l-mr-8"
          />
          <ui-button
            :type="7"
            size="large"
            icon="headphones"
            class="l-mr-8"
          />
        </div>

        <h3>Transparent button</h3>
        <div class="l-mt-12 l-mb-24">
          <ui-button
            :type="8"
            size="small"
          >
            Type --8
          </ui-button>
          <ui-button
            :type="8"
            size="small"
          >
            Type --8
          </ui-button>
        </div>

        <h3>Toggle buttons</h3>
        <div class="l-mt-12">
          <ui-button
            :type="13"
            size="small"
          >
            Type --13
          </ui-button>

          <ui-button
            :type="13"
            :active="true"
            size="small"
          >
            Type --13
          </ui-button>
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

</style>
