<template>
<div class="avatar" :style="containerSize">
    <div class="avatar__image" :style="avatarImage"></div>
    <div v-if="statusStyle" class="avatar__status">
        <div :style="statusStyle" class="avatar__status__dot"></div>
    </div>
    <div v-if="onair" class="avatar__onair"></div>
</div>
</template>

<script>
export default {
  data: function () {
    return {
      statusColors: {
        online: {
          'background-color': '#27AE60', // TODO: тут и дальше сделать цвета переменными
          'border-color': '#27AE60',
        },
        idle: {
          'background-color': '#FDCB4B',
          'border-color': '#FDCB4B',
        },
        offline: {
          'background-color': 'transparent',
          'border-color': '#B1B3B5',
        },
      },
    };
  },

  props: {
    size: {
      type: [ Number ],
      default: 24,
    },
    image: {
      type: [ String ],
      default: 'https://scontent.fhel6-1.fna.fbcdn.net/v/t1.0-1/cp0/p50x50/61704800_2456457874389149_363698698208673792_o.jpg?_nc_cat=102&_nc_sid=bbed71&_nc_eui2=AeFhQZ1G_1t_Fbpy-OSxN1NNZf6bi0FQEAjCV2_FJnD9tsxRLXlgzyxfhqzs17e3P0PEBlSHzj5MhVbTT038aSngASe2EMm25NcizzQ6zb_Ekw&_nc_oc=AQkDx8nxiAev5UJhDUo5Z6u6UWXr0lFfBx-h4sKh6TO28_n016DIMZ8geqwLYnhPJ1Q&_nc_ht=scontent.fhel6-1.fna&oh=280c3f02c48c386189c978d2db1feaa4&oe=5EA15F7E',
    },
    status: {
      type: [ String ],
      default: null,
    },
    onair: {
      type: [ Boolean ],
      default: false,
    },
  },

  computed: {
    avatarImage() {
      if (this.image) {
        return {
          'background-image': `url("${this.image}")`, // TODO: сделать resize-фильр для картинок с Леонардо
        };
      }

      return {};
    },
    containerSize() {
      return {
        height: this.size + 'px',
        width: this.size + 'px',
      };
    },
    statusStyle() {
      return this.statusColors[this.status] || null;
    },
  },

};
</script>

<style lang="stylus">
    .avatar
        position relative

        &__image
            width 100%
            height 100%
            background-color red
            background-position center
            background-size cover
            background-repeat no-repeat
            border-radius 50%

        &__status
            position absolute
            bottom -2px
            right -2px
            width calc(100% * 1/3)
            height calc(100% * 1/3)
            min-width 4px
            min-height 4px
            max-width 12px
            max-height 12px
            border-radius 50%
            background-color white //TODO: надо повторять цвет фона, на котором находится аватарка
            border 2px solid white //TODO: надо повторять цвет фона, на котором находится аватарка

            &__dot
                position absolute
                box-sizing border-box
                bottom 0px
                right 0px
                width 100%
                height 100%
                border-radius 50%
                border: 2px solid

        &__onair
            position absolute
            bottom 0
            right 0
            left 0
            top 0
            border-radius 50%
            background-color transparent
            border 2px solid green //TODO: var
            &::after
                content ''
                position absolute
                bottom 0
                right 0
                left 0
                top 0
                border-radius 50%
                background-color transparent
                border 2px solid white  //TODO: надо повторять цвет фона, на котором находится аватарка
</style>
