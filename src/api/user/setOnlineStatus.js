import axios from 'axios';
import { client } from '@api/socket/client';

export default function (status) {
  return axios.post(`/user/online-status?socketId=${client.id}`, {
    onlineStatus: status,
  });
}
