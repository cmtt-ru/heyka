<template>
  <div class="settings-page">
    <div class="privacy-text">Мы прозрачны и ценим вашу приватность: в этой вкладке всегда можно найти логи данных, которые отправляются на сервер.</div>
    <textarea readonly cols="30" rows="10">Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae dignissimos nam illo quasi rem modi sed architecto voluptates aperiam quas? Ea aperiam in nihil, assumenda atque a similique eaque delectus! Lorem ipsum dolor sit, amet consectetur adipisicing elit. Natus pariatur beatae dolore reiciendis eveniet laudantium incidunt eaque quos laborum nobis. Saepe hic reiciendis minima at, iure vero molestiae molestias provident! Lorem ipsum dolor sit amet consectetur adipisicing elit. Non nam aut corrupti distinctio hic rem a ipsum rerum officia eaque! Sunt commodi sint obcaecati a distinctio earum ratione vel ipsam?</textarea>
    <div class="settings__label">Отправка данных в Google Analytics для улучшения Heyka</div>
    <ui-switch v-model="general.analytics" text="Разрешить"/>
  </div>
</template>

<script>

// import UiButton from '@components/UiButton';
import { UiSwitch } from '@components/Form';

export default {
  components: {
    UiSwitch,
    // UiSelect,
    // UiInput,
    // UiButton,
  },
  data() {
    return {
      general: {
        analytics: false,
      },
    };
  },

  methods: {

  },
};
</script>

<style scoped lang="stylus">
.settings-page
  padding 8px 20px 12px

.privacy-text
  line-height 22px

textarea
  outline none
  resize none
  background-color var(--input)
  border 0.5px solid var(--stroke-3)
  border-radius 4px
  margin-top 14px
  padding 8px 12px 16px
  width 100%
  box-sizing border-box
  font-size 12px
  line-height 20px

</style>