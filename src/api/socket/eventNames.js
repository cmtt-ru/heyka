/**
 * Socket event names
 */
export default Object.freeze({
  /** Default socket io events */
  disconnect: 'disconnect',
  connectError: 'connect_error',
  reconnect: 'reconnect',
  reconnecting: 'reconnecting',
  error: 'error',

  /** Socket API events */
  auth: 'auth',
  authSuccess: 'auth-success',
  authSuccessError: 'socket-api-error-auth',

  channelCreated: 'channel-created',
  channelUpdated: 'channel-updated',
  channelDeleted: 'channel-deleted',

  userJoined: 'user-joined',
  userUnselectedChannel: 'user-unselected-channel',
  userSelectedChannel: 'user-selected-channel',
  userLeavedWorkspace: 'user-leaved-workspace',
  userUpdated: 'user-updated',

  changedDevice: 'user-changed-device',
  meUpdated: 'me-updated',
  mediaStateUpdated: 'media-state-updated',
  onlineStatusChanged: 'online-status-updated',
  socketApiError: 'socket-api-error',
  invite: 'invite',
  inviteResponse: 'invite-response',
  inviteCancelled: 'invite-cancelled',
  mutedForAll: 'muted-for-all',
  kickedFromWorkspace: 'kicked-from-workspace',
});
