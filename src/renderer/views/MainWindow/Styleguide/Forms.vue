<template>
  <div>
    <form name="styleguideform">
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
        :maxlength="25"
        email
        placeholder="Введите имя"
      />
      <br>
      <ui-input
        v-model="formData.settingsText"
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
      />
      <br>
      <br>
      <br>
      <ui-button
        :type="5"
        @click.native="submit()"
      >
        Submit
      </ui-button>
    </form>
  </div>
</template>

<script>

import UiButton from '@components/UiButton';
import { UiSwitch, UiSelect, UiInput } from '@components/Form';
import EditableList from '@components/List/EditableList';

export default {
  components: {
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
        name: 'Citroen',
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
      formData: {
        themeToggle: false,
        defaultEnabledToggle: true,
        disabledToggle: true,
        carFirstSelect: '',
        carSecondSelect: 'Honda',
        carDisabledSelect: 'Citroen',
        nameText: '',
        settingsText: 'Настройки',
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
    color var(--text-0)
  .ui-switch
    margin 16px 0
</style>