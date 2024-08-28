
import { io } from "socket.io-client";

const SOCKET_HOST = "http://localhost:8000"

const socket = io(SOCKET_HOST, { autoConnect: false });

export default socket;
