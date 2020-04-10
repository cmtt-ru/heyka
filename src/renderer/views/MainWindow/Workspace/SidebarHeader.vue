<template>
  <div class="l-p-8 l-w-m">
      <div v-if="workspace" class="workspace">

        <div class="workspace__wrapper">
            <img class="workspace__avatar" :src="workspace.avatar">
            <div class="workspace__name">{{workspace.name}}</div>
            <ui-button :type="7" class="workspace__expand" size="small" width="16" icon="arrow-down"/>
        </div>

        <ui-button :type="7" class="workspace__expand" size="small" icon="pin"/>

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

  computed: {
    workspace() {
      const channelId = this.$store.getters['me/getSelectedWorkspaceId'];

      console.log(this.$store.getters['workspaces/getWorkspaceById'](channelId));

      return this.$store.getters['workspaces/getWorkspaceById'](channelId);
    },
  },

  methods: {

  },

};
</script>

<style lang="stylus" scoped>

.workspace
    display flex
    flex-direction row
    justify-content space-between
    align-items center

    &__wrapper
        cursor pointer
        display flex
        flex-direction row
        justify-content space-between
        align-items center

    &__avatar
        width 14px
        height 14px
        border-radius 2px
        margin-right 6px

    &__name
        font-weight 500

</style>
