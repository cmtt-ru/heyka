import Vue from 'vue';
import { createPopper } from '@popperjs/core';

const LEFT_MOUSE = 1;
const RIGHT_MOUSE = 3;

const DEFAULT_OPTIONS = {

};

class Popover {
  /**
   * Popover constructor
   * @param {object} props - properties
   */
  constructor({ element, options = {}, componentName, modes, data = {} }) {
    const uidMax = 1000000;

    this.uid = Math.round(Math.random() * uidMax);

    this.element = element;
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.componentName = componentName;
    this.modes = modes;
    this.vueProps = data;

    this.instance = null;
    this.popper = null;

    this.events = {};

    this.mouseCoordinates = {
      x: 0,
      y: 0,
    };

    this.bind();
  }

  /**
   * Create virtual element with specific bounding client rect
   *
   * @param {HTMLElement} element – dom element
   * @param {number} x – x coordinate
   * @param {number} y – y coordinate
   * @returns {object}
   */
  createVirtualElement(element, x = 0, y = 0) {
    return {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        top: y,
        right: x,
        bottom: y,
        left: x,
      }),
      contextElement: element,
    };
  }

  /**
   * Dynamically load vue component
   *
   * @param {string} name – path to component
   * @returns {object}
   */
  async loadComponent(name) {
    const component = await System.import(`@views/ContextMenus/${name}.vue`);

    if (component.default) {
      return component.default;
    }
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

    const Component = await this.loadComponent(this.componentName);
    const ComponentClass = Vue.extend(Component);

    this.instance = new ComponentClass({
      propsData: this.vueProps,
    });
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
  }

  /**
   * Bind events on element
   *
   * @returns {void}
   */
  bind() {
    /* Handle click mode */
    if (this.modes.click) {
      this.element.__clickHandler = event => {
        if (this.modes.mouse) {
          this.options.placement = 'bottom-start';

          this.mouseCoordinates = {
            x: event.pageX,
            y: event.pageY,
          };

          if (this.modes.right) {
            if (event.which === RIGHT_MOUSE) {
              this.show(true);
            }
          } else {
            if (event.which === LEFT_MOUSE) {
              this.show(true);
            }
          }
        } else {
          this.show(true);
        }
      };

      this.element.__clickOutsideHandler = event => {
        if (!(this.element === event.target || this.element.contains(event.target))) {
          setTimeout(() => {
            this.show(false);
          }, parseInt('70'));
        }
      };

      this.element.addEventListener('mouseup', this.element.__clickHandler);
      document.body.addEventListener('mouseup', this.element.__clickOutsideHandler);
    }

    /* Handle hover mode */
    if (this.modes.hover) {
      this.element.__mouseEnterHandler = event => {
        this.show(true);
      };

      this.element.__mouseLeaveHandler = event => {
        this.show(false);
      };

      this.element.addEventListener('mouseenter', this.element.__mouseEnterHandler);
      this.element.addEventListener('mouseleave', this.element.__mouseLeaveHandler);
    }
  }

  /**
   * Unbind events on element
   *
   * @returns {void}
   */
  unbind() {
    if (this.element.__clickHandler) {
      this.element.removeEventListener('mouseup', this.element.__clickHandler);
      this.element.__clickHandler = null;
    }

    if (this.element.__mouseEnterHandler) {
      this.element.removeEventListener('mouseenter', this.element.__mouseEnterHandler);
      this.element.__mouseEnterHandler = null;
    }

    if (this.element.__mouseLeaveHandler) {
      this.element.removeEventListener('mouseleave', this.element.__mouseLeaveHandler);
      this.element.__mouseLeaveHandler = null;
    }

    if (this.element.__clickOutsideHandler) {
      document.body.removeEventListener('mouseup', this.element.__clickOutsideHandler);
      this.element.__clickOutsideHandler = null;
    }
  }

  /**
   * Show popover
   *
   * @param {boolean} state – whether to show or hide
   * @returns {Promise<void>}
   */
  async show(state = true) {
    if (state) {
      await this.mount();

      let refElement = this.element;

      if (this.modes.mouse) {
        refElement = this.createVirtualElement(this.element, this.mouseCoordinates.x, this.mouseCoordinates.y);
      }

      this.popper = createPopper(refElement, this.instance.$el, this.options);

      refElement = null;
    } else {
      await this.unmount();

      if (this.popper) {
        this.popper.destroy();
        this.popper = null;
      }
    }
  }

  /**
   * Destroy popover instance
   *
   * @returns {void}
   */
  destroy() {
    this.unmount();
    this.unbind();
  }
}

export default {
  bind: async (el, binding, vnode) => {
    const popover = new Popover({
      element: el,
      componentName: binding.value.name,
      options: binding.value.options,
      data: binding.value.data,
      modes: binding.modifiers,
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
