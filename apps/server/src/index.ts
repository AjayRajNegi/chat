import http from "http";
import SocketService from "./services/socket";

async function init() {
  const socketServer = new SocketService();
  const httpServer = http.createServer();
  const PORT = process.env.PORT ? process.env.PORT : 8000;

  socketServer.io.attach(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`HTTP Server running at PORT: ${PORT}`);
  });

  socketServer.initListeners();
}

init();
