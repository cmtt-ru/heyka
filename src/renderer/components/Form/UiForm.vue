<template>
  <div
    ref="form"
  >
    <slot />
  </div>
</template>

<script>

export default {

  props: {

    /**
     * Form's error
     */
    error: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      inputs: [],
    };
  },

  mounted() {
    this.listChildren();
    this.$on('ui-error', this.errorHandle);
  },

  methods: {
    listChildren() {
      this.inputs = this.$children.filter(child => {
        return typeof child.checkError !== 'undefined';
      });
      console.log(this.inputs);
    },

    errorHandle(value) {
      if (value === true) {
        console.log('ERRORS IN FORM');
        this.$emit('update:error', true);

        return;
      }
      this.$nextTick(() => {
        this.checkErrors();
      });
    },

    checkErrors() {
      for (const el of this.inputs) {
        if (el.checkError()) {
          console.log('SOME ERRORS');

          this.$emit('update:error', true);

          return;
        }
      }
      console.log('NO ERRORS');

      this.$emit('update:error', false);
    },
  },

};

</script>