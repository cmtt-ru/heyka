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

    /**
     * Find all children (and their children) that need validation
     * Also find submit button
     *
     * @returns {void}
     */
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

    /**
     * Find all children (and their children) of a vue component
     *
     * @param {VueComponent} el - vue component
     * @returns {void}
     */
    allChildren(el) {
      if (el.$children.length === 0) {
        return [];
      }

      return [...el.$children, ...el.$children.map(child => {
        return child.$children; // "return this.allChildren(child)" for full tree
      }).flat()];
    },

    /**
     * Handle error state change of some input
     *
     * @param {string} id - input's id
     * @param {boolean} value - true if validation failed
     * @returns {void}
     */
    errorHandler(id, value) {
      if (this.inputs[id] === undefined) {
        this.listChildren();
      }
      this.inputs[id].error = value;
      if (value === true) {
        this.updateErrorState(true);
      } else {
        this.checkErrors();
      }
    },

    /**
     * Determine if there are any failed validations in form
     *
     * @returns {void}
     */
    checkErrors() {
      for (const id in this.inputs) {
        if (this.inputs[id].error) {
          this.updateErrorState(true);

          return;
        }
      }
      this.updateErrorState(false);
    },

    /**
     * emit "update:error" event and disable submit button if validation failed
     *
     * @param {boolean} state - true if validation failed
     * @returns {void}
     */
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

    /**
     * Check all inputs than need to be validated and emit "sumbit" event if everything is ok
     *
     * @returns {void}
     */
    submitHandler() {
      let anyErrors = false;

      for (const id in this.inputs) {
        if (this.inputs[id].el.checkErrors(undefined, true) === true) {
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
