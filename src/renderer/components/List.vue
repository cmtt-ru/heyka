<template>
    <div class="list-view">
        <slot></slot>
    </div>
</template>

<script>
export default {
  data: function () {
    return {

    };
  },

  props: {
  },

  computed: {

  },

};
</script>

<style lang="stylus">
    .list-view
        border 1px solid var(--text-0)
</style>
