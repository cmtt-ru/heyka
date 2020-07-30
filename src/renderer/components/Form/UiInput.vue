<template>
  <div class="container">
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
        ref="input"
        v-model="localValue"
        class="input"
        :class="{'input--with-icon': icon, 'ui-error': errorText}"
        :placeholder="placeholder"
        @input="debounceCheck"
      >
    </div>
    <div
      v-if="errorText"
      class="error-text"
    >
      {{ errorText }}
    </div>
  </div>
</template>

<script>
import { debounce } from 'throttle-debounce';
import { v4 as uuid4 } from 'uuid';
const CHECK_DELAY = 500;
const NUMBER_REGEXP = /^\d*$/;
// eslint-disable-next-line no-useless-escape
const EMAIL_REGEXP = /^[a-z0-9]([a-z0-9_.\-]*)@([a-z0-9.\-]+)([.][a-z]{2,})$/i;

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

    /**
     * true if field is required
     */
    required: {
      type: Boolean,
      default: false,
    },

    /**
     * min length of input text
     */
    minlength: {
      type: Number,
      default: null,
    },

    /**
     * max length of input text
     */
    maxlength: {
      type: Number,
      default: null,
    },

    /**
     * true if only numbers are allowed
     */
    numbers: {
      type: Boolean,
      default: false,
    },

    /**
     * true if must be email
     */
    email: {
      type: Boolean,
      default: false,
    },

    /**
     * custom regExp for input to match
     */
    regex: {
      type: RegExp,
      default: null,
    },

    /**
     * error text for custom regExp
     */
    regexError: {
      type: String,
      default: 'default',
    },

    /**
     * error name from backend
     */
    backendError: {
      type: String,
      default: null,
    },

  },

  data() {
    return {
      id: uuid4(),
      validate: (!!this.required || !!this.minlength || !!this.maxlength || this.numbers || this.email || !!this.regex),
      errorText: null,
    };
  },

  computed: {

    localValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('inputErrors');
    },

  },

  watch: {
    backendError() {
      this.checkErrors();
    },
  },

  methods: {
    /**
     * Focus cursor on input
     * @returns {void}
     */
    focusInput() {
      this.$refs.input.focus();
    },

    /**
     * Debounce updating our info and sending API
     * @returns {void}
     */
    debounceCheck: debounce(CHECK_DELAY, false, function (el) {
      this.checkErrors(el.target.value);
    }),

    /**
     * Check input for validation errors
     * Also, edit error text accordingly
     *
     * @param {string} text - text in input
     * @returns {boolean} true if found any errors
     */
    checkErrors(text = this.localValue) {
      if (this.validate === false) {
        return;
      }
      this.errorText = null;
      const errors = [];

      if (text.length === 0) {
        const res = this.checkEmpty();

        return res;
      }
      if (this.minlength && this.minlength > text.length) {
        errors.push(`${this.texts['minlength']} ${this.minlength}`);
      } else if (this.maxlength && this.maxlength < text.length) {
        errors.push(`${this.texts['maxlength']} ${this.maxlength}`);
      }
      if (this.numbers && NUMBER_REGEXP.test(text) === false) {
        errors.push(this.texts['numbers']);
      }
      if (this.email && EMAIL_REGEXP.test(text) === false) {
        errors.push(this.texts['email']);
      }
      if (this.regex && this.regex.test(text) === false) {
        errors.push(this.texts[this.regexError] || this.texts['default']);
      }
      if (this.backendError) {
        errors.push(this.texts[this.backendError] || this.texts['defaultBackend']);
      }

      if (errors.length > 0) {
        this.errorText = errors.join('\n');
        this.$parent.$emit('ui-error', this.id, true);

        return true;
      } else {
        this.$parent.$emit('ui-error', this.id, false);

        return false;
      }
    },

    /**
     * Check if input is empty and required
     *
     * @returns {boolean}
     */
    checkEmpty() {
      if (this.required === true) {
        this.errorText = this.texts['required'];
        this.$parent.$emit('ui-error', this.id, true);

        return true;
      } else {
        this.$parent.$emit('ui-error', this.id, false);

        return false;
      }
    },

  },

};
</script>

<style lang="stylus" scoped>
.container
  width 100%

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
  color var(--text-0)

  &__icon
    position absolute
    top 9px
    left 9px
    color var(--icon-1)

  &--with-icon
    padding-left 30px

.ui-error
  border-color var(--color-0)

.error-text
  color var(--text-tech-0)
  font-size 10px
  line-height 12px
  min-height 16px
  padding-top 6px
  display flex
  flex-direction column
  justify-content center
  align-items flex-start
  white-space pre-line

</style>
