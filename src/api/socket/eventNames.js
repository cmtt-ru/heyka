/**
 * Socket event names
 */
export default Object.freeze({
  /** Default socket io events */
  disconnect: 'disconnect',
  connectError: 'connect_error',
  reconnect: 'reconnect',
  error: 'error',

  /** Socket API errors */
  auth: 'auth',
  authSuccess: 'auth-success',
  authSuccessError: 'socket-api-error-auth',
  channelCreated: 'channel-created',
  userJoined: 'user-joined',
  userUnselectedChannel: 'user-unselected-channel',
  userSelectedChannel: 'user-selected-channel',
  changedDevice: 'user-changed-device',
  mediaStateUpdated: 'media-state-updated',
  userLeavedWorkspace: 'user-leaved-workspace',
  channelDeleted: 'channel-deleted',
  userUpdated: 'user-updated',
  onlineStatusChanged: 'online-status-updated',
  socketApiError: 'socket-api-error',
});
