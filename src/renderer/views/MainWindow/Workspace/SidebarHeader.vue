<template>
  <div class="l-p-8 l-fw-m">
      <div v-if="workspace" class="workspace">

        <div @click="dropdownHandler()" class="workspace__wrapper">
            <img class="workspace__avatar" :src="workspace.avatar">
            <div>{{workspace.name}}</div>
            <ui-button :type="7" class="workspace__expand" size="small" height="16" icon="arrow-down"/>
        </div>

        <ui-button :type="7" size="small" icon="search"/>

    </div>

  </div>

</template>

<script>
import UiButton from '@components/UiButton';

export default {
  components: {
    UiButton,
  },

  computed: {
    /**
     * Get current workspace instance
     * @returns {object}
     */
    workspace() {
      const channelId = this.$store.getters['me/getSelectedWorkspaceId'];

      return this.$store.getters['workspaces/getWorkspaceById'](channelId);
    },
  },

  methods: {
    /**
     * Dummy popover creation
     * @returns {void}
     */
    dropdownHandler() {
      console.log('popover with settings and all workspaces');
      this.$router.push('/main-window/settings');
    },
  },

};
</script>

<style lang="stylus" scoped>

.workspace
    display flex
    flex-direction row
    justify-content space-between
    align-items center
    padding 0 4px

    &__wrapper
        cursor pointer
        display flex
        flex-direction row
        justify-content space-between
        align-items center

    &__expand
        margin-left 4px
        margin-top 1px

    &__avatar
        width 14px
        height 14px
        border-radius 2px
        margin-right 6px

</style>
