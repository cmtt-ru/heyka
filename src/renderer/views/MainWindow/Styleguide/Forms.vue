<template>
  <div>
    <ui-form
      :error.sync="formError"
      @submit="submit"
    >
      <h3 class="l-mt-24">
        Switch
      </h3>
      <br>
      <ui-switch
        v-model="formData.themeToggle"
        class="ui-switch"
        text="Тёмная тема"
      />
      <ui-switch
        v-model="formData.defaultEnabledToggle"
        class="ui-switch"
        text="Я изначально включён"
      />
      <ui-switch
        v-model="formData.disabledToggle"
        class="ui-switch"
        disabled
        text="А я не работаю"
      />
      <br>

      <h3 class="l-mt-24">
        Select
      </h3>
      <br>
      <ui-select
        v-model="formData.carFirstSelect"
        :data="carDropdownData"
        text="Выбрать машину"
        required
      />
      <br>
      <ui-select
        v-model="formData.carSecondSelect"
        :data="carDropdownData"
      />
      <br>
      <ui-select
        v-model="formData.carDisabledSelect"
        disabled
        :data="carDropdownData"
      />
      <br>

      <h3 class="l-mt-24">
        Input
      </h3>
      <br>
      <ui-input
        v-model="formData.nameText"
        :maxlength="15"
        email
        enter-submit
        regex-error="numbers"
        placeholder="email, maxlength 15"
      />
      <br>
      <ui-input
        v-model="formData.settingsText"
        required
        placeholder="required *"
        icon="settings"
      />
      <br>
      <ui-input
        v-model="formData.disabledText"
        disabled
      />
      <br>
      <editable-list
        v-model="formData.deletableText"
        add-text="Add email"
        placeholder="Меня можно удалить"
        numbers
      />
      <br>
      <br>
      <br>
      <ui-button
        :type="5"
        submit
      >
        Submit
      </ui-button>
    </ui-form>
  </div>
</template>

<script>

import UiButton from '@components/UiButton';
import { UiForm, UiSwitch, UiSelect, UiInput } from '@components/Form';
import EditableList from '@components/List/EditableList';

export default {
  components: {
    UiForm,
    UiSwitch,
    UiSelect,
    UiInput,
    UiButton,
    EditableList,
  },
  data() {
    return {
      carDropdownData: [ {
        name: 'Audi',
        value: 'Audi',
      },
      {
        name: 'BMW',
        value: 'BMW',
      },
      {
        name: 'Citroen Citroen',
        value: 'Citroen',
      },
      {
        name: 'Ford',
        value: 'Ford',
      },
      {
        name: 'Honda',
        value: 'Honda',
      } ],
      formError: false,
      formData: {
        themeToggle: false,
        defaultEnabledToggle: true,
        disabledToggle: true,
        carFirstSelect: '',
        carSecondSelect: 'Honda',
        carDisabledSelect: 'Citroen',
        nameText: '',
        settingsText: '',
        disabledText: 'Я не работаю',
        deletableText: ['111', '222'],
      },
    };
  },

  methods: {
    submit() {
      console.log(this.formData);
    },
  },
};
</script>

<style scoped lang="stylus">
  h3
    color var(--UI-active)
  .ui-switch
    margin 16px 0
</style>