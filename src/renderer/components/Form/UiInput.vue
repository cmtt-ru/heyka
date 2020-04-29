<template>
  <div
    class="input-wrapper"
    :class="{'input-wrapper--disabled': disabled}"
  >
    <svg-icon
      v-if="icon"
      class="input__icon"
      :name="icon"
      size="medium"
    ></svg-icon>

    <input
      class="input"
      :class="{'input--with-icon': icon}"
      :type="type"
      :placeholder="placeholder"
      v-model="myValue"
      @input="updateText()"
    >

  </div>
</template>

<script>

export default {

  props: {

    /**
     * input's value
     */
    value: {
      type: String,
      default: '',
    },

    /**
     * Name to identify in form
     */
    name: {
      type: String,
    },

    /**
     * input's type
     */
    type: {
      type: String,
      default: 'text',
    },

    /**
     * input's placeholder
     */
    placeholder: {
      type: String,
      default: '',
    },

    /**
     * input's icon
     */
    icon: {
      type: String,
      default: null,
    },

    textarea: {
      type: Boolean,
      default: false,
    },

    /**
     * Make whole switch inactive
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      myValue: this.value,
    };
  },

  computed: {

  },

  methods: {
    updateText() {
      this.$emit('input', this.myValue);
    },
  },

};
</script>

<style lang="stylus" scoped>
.input-wrapper
  width 100%
  position relative
  display flex
  flex-direction row
  align-items center

  &--disabled
    opacity 0.5
    pointer-events none

.input
  width 100%
  min-height 32px
  padding 0 12px
  box-sizing border-box
  border 1px solid var(--stroke-3)
  border-radius 4px
  background-color var(--input)
  font-family Inter, sans-serif
  font-size 14px
  line-height 18px

  &__icon
    position absolute
    top 9px
    left 9px
    color var(--icon-1)

  &--with-icon
    padding-left 30px

</style>
