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
      inputs: {},
      submitBUtton: null,
    };
  },

  mounted() {
    this.listChildren();
    this.$on('ui-error', this.errorHandler);
    this.$on('ui-submit', this.submitHandler);
    this.$on('changed-number-of-inputs', this.listChildren);
  },

  methods: {
    listChildren() {
      const savedInputs = this.inputs;

      this.inputs = {};
      const elements = this.allChildren(this);
      const needValidation = elements.filter(child => {
        return child.validate === true;
      });

      for (const el of needValidation) {
        this.$set(this.inputs, el.id, {
          el: el,
          error: savedInputs[el.id]?.error || false,
        });
      }
      this.submitBUtton = elements.find(el => el.submit === true);
      this.checkErrors();
    },

    allChildren(el) {
      if (el.$children.length === 0) {
        return [];
      }

      return [...el.$children, ...el.$children.map(child => {
        return child.$children;
      }).flat()];
    },

    errorHandler(id, value) {
      this.inputs[id].error = value;
      if (value === true) {
        this.updateErrorState(true);

        return;
      }
      this.checkErrors();
    },

    checkErrors() {
      for (const id in this.inputs) {
        if (this.inputs[id].error) {
          this.updateErrorState(true);

          return;
        }
      }
      this.updateErrorState(false);
    },

    updateErrorState(state) {
      this.$emit('update:error', state);
      if (this.submitBUtton === undefined) {
        return;
      }
      if (state) {
        this.submitBUtton.$el.classList.add('ui-button--disabled');
      } else {
        this.submitBUtton.$el.classList.remove('ui-button--disabled');
      }
    },

    submitHandler() {
      let anyErrors = false;

      for (const id in this.inputs) {
        if (this.inputs[id].el.checkErrors() === true) {
          anyErrors = true;
        }
      }
      if (anyErrors === false) {
        this.$emit('submit');
      } else {
        this.$emit('submit-error');
      }
    },

  },

};

</script>