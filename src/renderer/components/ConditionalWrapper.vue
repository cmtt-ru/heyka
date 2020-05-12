<script>
export default {
  functional: true,
  props: {
    wrap: {
      type: Boolean,
      default: false,
    },
  },
  render(h, ctx) {
    const children = ctx.children.filter(vnode => vnode.tag);

    if (children.length !== 1) {
      console.warn('this component accepts only one root node in its slot');
    }

    if (ctx.props.wrap) {
      return children[0];
    } else {
      return children[0].children.filter(function (e) {
        return e.tag !== undefined;
      })[0];
    }
  },
};
</script>
