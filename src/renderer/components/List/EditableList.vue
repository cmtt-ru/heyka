<template>
  <div>
    <div
      v-for="(input, index) in listData"
      :key="input.id"
      class="list-item"
    >
      <ui-input
        v-model="input.value"
        :placeholder="placeholder"
        @input="update()"
      />
      <ui-button
        class="icon-delete"
        :type="7"
        size="small"
        icon="trash"
        @click.native="deleteItem(index)"
      />
    </div>

    <ui-button
      v-if="addText"
      class="add-button"
      :type="9"
      icon="add"
      @click.native="add('')"
    >
      {{ addText }}
    </ui-button>
  </div>
</template>

<script>

import UiInput from '@components/Form/UiInput.vue';
import UiButton from '@components/UiButton';

export default {

  components: {
    UiInput,
    UiButton,
  },

  props: {
    /**
     * Upper array with data {name, value}
     */
    value: {
      type: Array,
      required: true,
    },

    /**
     * input's placeholder
     */
    placeholder: {
      type: String,
      default: '',
    },

    /**
     * text of "add new"-button. hide button if none
     */
    addText: {
      type: String,
      default: null,
    },

  },

  data() {
    return {
      /**
        * We convert values to array with {'id', 'value'} so that we can assign unique keys (id) to items
      */
      listData: this.value.map((el) => {
        return {
          id: this.UniqueHash(),
          value: el,
        };
      }),
    };
  },

  methods: {
    /**
     * Emit 'input' on any kind of update (new element, deleted element, changed element)
     * @returns {void}
     */
    update() {
      this.$emit('input', this.dataToPlainArray(this.listData));
    },

    /**
     * Add new element to list
     * @param {any} el new element to add (string or object)
     * @returns {void}
     */
    add(el) {
      this.listData.push({
        id: this.UniqueHash(),
        value: el,
      });
      this.update();
    },

    /**
     * Remove element from list
     * @param {number} index index in array
     * @returns {void}
     */
    deleteItem(index) {
      this.listData.splice(index, 1);
      this.update();
    },

    /**
     * Flatten array of {id: something, value: something} to array with {value: somethimg}
     * @param {array} data array to flatten
     * @returns {array} flattened array
     */
    dataToPlainArray(data) {
      return data.map(el => el.value);
    },

    /**
     * Generate unique id for elements.
     * @returns {number} unique id
     */
    UniqueHash() {
      return Date.now() + Math.random();
    },

  },

};
</script>

<style lang="stylus" scoped>
.list-item
    margin 12px 0
    display flex
    flex-direction row
    align-items center

.icon-delete
    color var(--color-0)
    margin 0 4px 0 8px
    flex-shrink 0

.add-button
    margin 2px 0
</style>
