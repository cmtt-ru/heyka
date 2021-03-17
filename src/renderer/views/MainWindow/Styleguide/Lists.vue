<template>
  <div>
    <h1 class="l-mt-12">
      Lists
    </h1>

    <h3 class="l-mt-24">
      Selectable and searchable list.<br><br>
    </h3>
    <ui-input
      v-model="filterKey"
      icon="search"
      placeholder="Filter by..."
    />
    <list
      v-model="filteredElements"
      selectable
      :items="elements"
      :filter-by="filterKey"
      filter-key="name"
      @multipick="selectItem"
    >
      <list-item
        v-for="user in filteredElements"
        :key="user.name"
        :similarity="user.similarity"
        :select-data="user"
      >
        <div
          v-textfade
          class="styleguide-user"
        >
          {{ user.name }}
        </div>
      </list-item>
    </list>

    <div class="l-mt-12">
      <div />
      <div>{{ selectedArray }}</div>
    </div>
  </div>
</template>

<script>

import { List, ListItem } from '@components/List';
import { UiInput } from '@components/Form';

export default {
  components: {
    List,
    ListItem,
    UiInput,
  },
  data() {
    return {
      filterKey: '',
      filteredElements: [],
      selectedArray: [],
      elements: [
        { name: 'Ivan Bushmin' },
        { name: 'Артём Котлетов' },
        { name: 'Coco Chanel' },
        { name: 'Katherine Heigl' },
        { name: 'Bethenny Frankel' },
        { name: 'Nicole Kidman' },
        { name: 'Thomas Edison' },
        { name: 'Freddie Mercury' },
        { name: 'Nicolas Cage' },
        { name: 'George Clooney' },
      ],
    };
  },

  created() {

  },
  methods: {
    selectItem(data) {
      this.selectedArray = data;
    },
  },
};
</script>

<style scoped lang="stylus">
  h3
    color var(--text-0)

  .styleguide-user
    width 100%
    border-radius 4px
    margin-top 4px
    cursor pointer
    padding 8px 8px 8px 16px

    &:hover
      background-color var(--item-bg-hover)
</style>
