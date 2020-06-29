
/**
 * Basically we add 'click' event listener to the document
 * And in "clickOutsideEvent" we check if target is our element or its child.
 * If not - we trigger method passed to this directive
 */
export default {
  bind: function (el, binding, vnode) {
    el.clickOutsideEvent = function (event) {
      if (!(el === event.target || el.contains(event.target))) {
        vnode.context[binding.expression](event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unbind: function (el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
    el.clickOutsideEvent = null;
  },
};
