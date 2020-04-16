import Vue from 'vue';
import { createPopper } from '@popperjs/core';
// import Popover from '@components/Popover';

/**
 * @class Popover
 */
class Popover {
  /**
   * Popover constructor
   * @param {object} props - properties
   */
  constructor(props) {
    const uidMax = 1000000;

    this.uid = Math.round(Math.random() * uidMax);
    this.element = props.el;
    this.options = props.options;
    this.name = props.name;
    this.instance = null;
    this.popper = null;
  }

  /**
   * Mount vue component
   *
   * @returns {Promise<void>}
   */
  async mount() {
    if (this.instance) {
      return;
    }

    const Component = await loadComponent(this.name);
    const ComponentClass = Vue.extend(Component);

    this.instance = new ComponentClass();
    this.instance.$mount();

    document.body.appendChild(this.instance.$el);
  }

  /**
   * Unmount and destroy vue component
   *
   * @returns {void}
   */
  unmount() {
    if (this.instance) {
      this.instance.$destroy();
      this.instance.$el.remove();
      this.instance = null;
    }

    if (this.popper) {
      this.popper.destroy();
      this.popper = null;
    }
  }

  /**
   * Show popover
   *
   * @returns {Promise<void>}
   */
  async show() {
    await this.mount();

    this.popper = createPopper(this.element, this.instance.$el, {

    });
  }
}

/**
 * Dynamically load vue component
 *
 * @param {string} name – path to component
 * @returns {object}
 */
async function loadComponent(name) {
  const component = await System.import(`@views/ContextMenus/${name}.vue`);

  if (component.default) {
    return component.default;
  }
}

export default {
  bind: async (el, binding, vnode) => {
    const popover = new Popover({
      el,
      name: 'Some',
      options: {

      },
    });

    /** Save popover instance in vnode context */
    vnode.context[`_popoverInstance${popover.uid}`] = popover;
    el.setAttribute('popover-instance-uid', popover.uid);

    el.clickOutsideEvent = function (event) {
      if (!(el === event.target || el.contains(event.target))) {
        popover.unmount();
      }
    };

    el.addEventListener('click', event => {
      popover.show();
    });

    document.body.addEventListener('click', el.clickOutsideEvent);
  },

  unbind: (el, binding, vnode) => {
    /** Get popover instance from vnode context by his uid */
    const popoverUid = el.getAttribute('popover-instance-uid');
    const popover = vnode.context[`_popoverInstance${popoverUid}`];

    popover.unmount();

    document.body.removeEventListener('click', el.clickOutsideEvent);

    delete vnode.context[`_popoverInstance${popoverUid}`];
  },
};
