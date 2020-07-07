/**
 * Convert array of object into object with specific key
 *
 * @param {array} array – source array
 * @param {string} key – specific key
 * @returns {object}
 */
export function mapKeys(array, key) {
  const object = {};
  const arrayLength = array.length;

  for (let i = 0; i < arrayLength; i++) {
    object[array[i][key]] = array[i];
  }

  return object;
}

/**
 * Sort function than can sort by options:
 *   key: key to sort by
 *   priority: Array of key variants, with more important values going first. I
 *      If value was not found, such elements are placed first
 *   name: Key to sort if "priority" of elementys is the same
 *
 * @param {array} options – sort options
 * @returns {function(...[*]=)}
 */
export function sortByPriority(options = {
  key: 'onlineStatus',
  priority: ['online', 'idle', 'offline'],
  name: 'name',
}) {
  return (a, b) => {
    const delta = options.priority.indexOf(a[options.key]) - options.priority.indexOf(b[options.key]);

    if (delta > 0) {
      return 1;
    } else if (delta < 0) {
      return -1;
    } else {
      if (a[options.name] > b[options.name]) {
        return 1;
      }
      if (a[options.name] < b[options.name]) {
        return -1;
      }

      return 0;
    }
  };
}

/**
 * Sort function than can sort by options:
 *   key: 'anyKey'
 *   type: 'string' | 'number' | 'date'
 *   order: 'asc' | 'desc'
 *
 * @param {array} options – sort options
 * @returns {function(...[*]=)}
 */
export function sortAny(options = [ {
  key: 'value',
  type: 'string',
  order: 'asc',
} ]) {
  if (!(options instanceof Array)) {
    options = [ options ];
  }

  return (a, b) =>
    options
      .map((field) => {
        if (a[field.key] === undefined || b[field.key] === undefined) {
          return 0;
        }

        const direction = field.order === 'asc' ? 1 : -1;

        let firstValue;
        let secondValue;

        if (field.type === 'string') {
          firstValue = a[field.key].toUpperCase().trim();
          secondValue = b[field.key].toUpperCase().trim();
        } else if (field.type === 'number') {
          firstValue = parseInt(a[field.key], 10);
          secondValue = parseInt(b[field.key], 10);
        } else if (field.type === 'date') {
          firstValue = new Date(a[field.key]);
          secondValue = new Date(b[field.key]);
        } else if (field.type === 'boolean') {
          firstValue = a[field.key] ? 1 : 0;
          secondValue = b[field.key] ? 1 : 0;
        }

        if (firstValue > secondValue) {
          return direction;
        } else if (firstValue < secondValue) {
          return -(direction);
        } else {
          return 0;
        }
      }).reduce((pos, neg) => pos || neg, 0);
}

/**
 * Search key with value in array
 *
 * @param {array} array – array of objects
 * @param {string} key – array key
 * @param {string} keyValue – value of the key
 * @returns {number}
 */
export function searchIndexByKey(array, key, keyValue) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][key] === keyValue) {
      return i;
    }
  }
}
