import Popover from '@classes/Popover';

export default {
  bind: async (el, binding, vnode) => {
    const popover = new Popover({
      element: el,
      componentName: 'Tooltip',
      data: {
        label: binding.value,
      },
      modes: {
        hover: true,
      },
    });

    /** Save popover instance in vnode context */
    vnode.context[`_tooltipInstance${popover.uid}`] = popover;
    el.setAttribute('tooltip-instance-uid', popover.uid);
  },

  unbind: (el, binding, vnode) => {
    /** Get popover instance from vnode context by his uid */
    const popoverUid = el.getAttribute('tooltip-instance-uid');
    const popover = vnode.context[`_tooltipInstance${popoverUid}`];

    popover.destroy();

    delete vnode.context[`_tooltipInstance${popoverUid}`];
  },

  update: (el, binding, vnode) => {
    /** Get popover instance from vnode context by his uid */
    const popoverUid = el.getAttribute('tooltip-instance-uid');
    const popover = vnode.context[`_tooltipInstance${popoverUid}`];

    popover.updateData({
      label: binding.value,
    });
  },
};
