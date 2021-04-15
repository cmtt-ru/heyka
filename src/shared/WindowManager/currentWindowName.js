const templateArg = window.navigator.userAgent
  .split(' ')
  .find(u => u.includes('template:'));

let windowName = 'unknown';

if (templateArg) {
  windowName = templateArg.split(':')[1];
}

/**
 * Current window name
 * @returns {string}
 */
export default function () {
  return windowName;
};
