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
