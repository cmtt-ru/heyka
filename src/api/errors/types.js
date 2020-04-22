/**
 * Some temp comments
 *
 * [badToken, credentialsAreInvalid, refreshTokenExpired] – выкидываем авторизацию
 * accessDenied – локальный обработчик
 * internalServerError – что-то пошло не так
 * socketNotFound – если есть активный сокет и возращается эта ошибка. Пока просто выводить ошибку, но можно дисконектить сокет и заново приконектить и повторить запрос
 *
 * @type {object}
 */
export const errorMessages = {
  badToken: 'Bad token',
  internalServerError: 'Internal Server Error',
  accessTokenExpired: 'Access token is expired',

  // Universal error messages
  accessDenied: 'Access denied',
  notFound: 'Not found',

  // Leave channel
  activeConversation: 'Active conversation',

  // Unselect channel
  channelNotSelected: 'Channel not selected',
  channelSelectedByAnotherDevice: 'Channel selected by another device',

  // Auth by link
  authLinkInvalid: 'Auth link is not valid',

  // Change online status
  socketNotFound: 'Socket not found',

  // Refresh token
  credentialsAreInvalid: 'Credentials are invalid',
  tokenExpired: 'Token is expired',
  refreshTokenExpired: 'Refresh token is expired',

  // Sign in
  emailOrPasswordAreInvalid: 'Email or password are invalid',

  // Sign up
  emailExists: 'A user with that email address has already signed up',

  // Email verification
  verificationCodeIsNotValid: 'Verification code is not valid',
};
