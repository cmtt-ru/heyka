const events = ['click', 'dblclick', 'mousedown', 'mouseup'];

const handler = event => {
  event.stopPropagation();
};

/**
 * Stop lots of events from propagating to parent
 * Or only events passed as modifiers
 */
export default {
  bind: function (el, binding) {
    if (Object.keys(binding.modifiers).length > 0) {
      for (const mod in binding.modifiers) {
        el.addEventListener(mod, handler);
      }
    } else {
      for (let i = 0; i < events.length; i++) {
        el.addEventListener(events[i], handler);
      }
    }
  },
  unbind: function (el) {
    for (let i = 0; i < events.length; i++) {
      el.removeEventListener(events[i], handler);
    }
  },
};