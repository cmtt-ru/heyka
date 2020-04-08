/**
 * Convert array of object into object with specific key
 *
 * @param {array} array – source array
 * @param {string} key – specific key
 * @return {object}
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
 * Convert array of object into object with specific key
 *
 * @param {object} obj – source obj
 * @return {object}
 */
export function flattenObject(obj) {
  const array = [];

  for (const id in obj) {
    array.push(obj[id]);
  }

  return array;
}

/**
 * Sort function than can sort by options:
 *   key: 'anyKey'
 *   type: 'string' | 'number' | 'date'
 *   order: 'asc' | 'desc'
 *
 * @param {array} options – sort options
 * @return {function(...[*]=)}
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

        return firstValue > secondValue ? direction : firstValue < secondValue ? -(direction) : 0;
      }).reduce((pos, neg) => pos || neg, 0);
}
