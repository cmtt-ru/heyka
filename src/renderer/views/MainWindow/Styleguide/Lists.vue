<template>
  <div>

    <h1 class="l-mt-12">Lists</h1>

    <h3 class="l-mt-24">Selectable and searchable list.<br><br></h3>
    <ui-input v-model="filterKey" icon="search" placeholder="Filter by..."/>
    <list selectable :filterBy="filterKey" @multipick="selectItem">
      <list-item
        v-for="user in elements"
        :key="user.name"
        :filterKey="user.name"
        button
      >
      <channel-user-item :user="user"></channel-user-item>
      </list-item>
    </list>

    <div class="l-mt-12">
      <div></div>
      <div>{{selectedArray}}</div>
    </div>

  </div>
</template>

<script>

import { List, ListItem } from '@components/List';
import { UiInput } from '@components/Form';
import ChannelUserItem from '@components/ChannelUserItem';

export default {
  components: {
    List,
    ListItem,
    UiInput,
    ChannelUserItem,
  },
  data() {
    return {
      filterKey: '',
      selectedArray: [],
      elements: [
        { name: 'Ivan Bushmin' },
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
  methods: {
    selectItem(data) {
      this.selectedArray = data;
    },
  },

  created() {

  },
};
</script>

<style scoped lang="stylus">
  h3
    color var(--text-0)
</style>
