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
    />

    <input
      v-model="myValue"
      class="input"
      :class="{'input--with-icon': icon}"
      :type="type"
      :placeholder="placeholder"
      @input="updateText()"
    >
  </div>
</template>

<script>

export default {

  props: {

    /**
     * Input's value
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
      default: '',
    },

    /**
     * Input's type
     */
    type: {
      type: String,
      default: 'text',
    },

    /**
     * Input's placeholder
     */
    placeholder: {
      type: String,
      default: '',
    },

    /**
     * Input's icon
     */
    icon: {
      type: String,
      default: null,
    },

    /**
     * Is textarea?
     */
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

  watch: {
    value(newValue, oldValue) {
      this.myValue = newValue;
    },
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
  background-color var(--input)

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
  background-color transparent
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
