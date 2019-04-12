import io from 'socket.io-client';
const socket = io('http://172.19.16.126:5000/');

export default socket;