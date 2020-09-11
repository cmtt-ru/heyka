<template>
  <div class="ui-tabs">
    <div class="ui-tabs__nav">
      <ui-button
        v-for="tab in tabs"
        :key="tab.name"
        :type="15"
        :active="tab.name === selectedTabName"
        @click="selectTab(tab.name)"
      >
        {{ tab.name }}
      </ui-button>
    </div>

    <div class="ui-delimiter" />

    <div class="ui-tabs__content">
      <slot />
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';

export default {
  components: {
    UiButton,
  },

  props: {

  },

  data() {
    return {
      selectedTabName: null,
      tabs: [],
    };
  },

  mounted() {
    this.tabs = this.$children.map(c => {
      if (c.selected) {
        this.selectedTabName = c.name;
      }

      return {
        name: c.name,
        selected: c.selected,
      };
    });

    if (!this.selectedTabName) {
      this.selectTab(this.tabs[0].name);
    }

    this.selectTab(this.selectedTabName);
  },

  methods: {
    /**
     * Select tab by tab name
     * @param {string} name – tab name
     * @returns {void}
     */
    selectTab(name) {
      this.selectedTabName = name;

      this.$children.forEach(tab => {
        tab.isSelected = tab.name === name;
      });
    },
  },
};
</script>

<style scoped lang="stylus">
  .ui-tabs
    &__nav
      padding-bottom 12px

    &__content
      padding 0
</style>
