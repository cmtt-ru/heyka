import Vue from 'vue';
import router from '@/router';
import store from '@/store';
import i18n from '@/i18n';
import { createPopper } from '@popperjs/core';

/**
 * @typedef {object} PopoverModes
 * @property {boolean} click – click mode
 * @property {boolean} hover – hover mode
 * @property {boolean} mouse – mouse mode
 * @property {boolean} right – right mouse button mode
 */

/**
 * Left mouse button
 * @type {number}
 */
const LEFT_MOUSE = 1;

/**
 * Right mouse button
 * @type {number}
 */
const RIGHT_MOUSE = 3;

/**
 * Default popper options
 * @type {object}
 */
const DEFAULT_POPPER_OPTIONS = {
  /* nothing yet here */
  modifiers: [
    {
      name: 'offset',
      options: {
        // eslint-disable-next-line no-magic-numbers
        offset: [8, 8],
      },
    },
    {
      name: 'preventOverflow',
      options: {
        padding: 8,
      },
    },
  ],
};

/**
 * Active class when popover opened
 * @type {string}
 */
const ACTIVE_CLASS = 'context-menu--opened';

/**
 * Max number for unique id
 * @type {number}
 */
const UID_MAX = 1000000;

/**
 * Wait before destroy popover
 * @type {number}
 */
const TIMEOUT_BEFORE_DESTROY = 70;

/**
 * Class for popovers
 */
class Popover {
  /**
   * Popover constructor
   * @param {HTMLElement} element – show popover near this element
   * @param {object} options – popover options
   * @param {string} componentName – context menu component name
   * @param {PopoverModes} modes – popover mode
   * @param {object} data – some data to pass to context menu component
   */
  constructor({ element, options = {}, componentName, modes, data = {} }) {
    this.uid = Math.round(Math.random() * UID_MAX);

    this.element = element;
    this.options = Object.assign({}, DEFAULT_POPPER_OPTIONS, options);
    this.componentName = componentName;
    this.modes = modes;
    this.vueProps = data;

    this.instance = null;
    this.popper = null;

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

    ComponentClass.options.router = router;
    ComponentClass.options.store = store;
    ComponentClass.options.i18n = i18n;

    this.instance = new ComponentClass({
      propsData: this.vueProps,
    });

    this.instance.$mount();

    document.body.appendChild(this.instance.$el);

    this.element.classList.add(ACTIVE_CLASS);
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
      this.element.classList.remove(ACTIVE_CLASS);
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
          this.options = {};
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
        if (!(this.instance.$el === event.target || this.instance.$el.contains(event.target))) {
          setTimeout(() => {
            this.show(false);
          }, TIMEOUT_BEFORE_DESTROY);
        }
      };

      this.element.addEventListener('mouseup', this.element.__clickHandler);
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
      setTimeout(() => {
        document.body.addEventListener('mouseup', this.element.__clickOutsideHandler);
      }, 0);
    } else {
      await this.unmount();
      if (this.element.__clickOutsideHandler) {
        document.body.removeEventListener('mouseup', this.element.__clickOutsideHandler);
      }
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

    this.element = null;
    this.instance = null;
    this.popper = null;
    this.vueProps = null;
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
