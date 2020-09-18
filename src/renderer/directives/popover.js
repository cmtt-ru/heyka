import Popover from '@sdk/classes/Popover';

export default {
  bind: async (el, binding, vnode) => {
    const popover = new Popover({
      element: el,
      componentName: binding.value.name,
      options: binding.value.options,
      data: binding.value.data,
      modes: binding.modifiers,
      permissions: binding.value.permissions,
    });

    /** Save popover instance in vnode context */
    vnode.context[`_popoverInstance${popover.uid}`] = popover;
    el.setAttribute('popover-instance-uid', popover.uid);
  },

  unbind: (el, binding, vnode) => {
    /** Get popover instance from vnode context by his uid */
    const popoverUid = el.getAttribute('popover-instance-uid');
    const popover = vnode.context[`_popoverInstance${popoverUid}`];

    popover.destroy();

    delete vnode.context[`_popoverInstance${popoverUid}`];
  },
};
