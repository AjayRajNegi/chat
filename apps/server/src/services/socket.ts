import Redis from "ioredis";
import { Server } from "socket.io";

const pub = new Redis({
  host: "redis-17239.c264.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 17239,
  username: "default",
  password: "GrNN8pWlDBDZLtGUTGRkS28LKLOPuO6O",
});
const sub = new Redis({
  host: "redis-17239.c264.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 17239,
  username: "default",
  password: "GrNN8pWlDBDZLtGUTGRkS28LKLOPuO6O",
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Init Socket Server");
    this._io = new Server({
      cors: {
        allowedHeaders: "*",
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  public initListeners() {
    console.log("Init Socket Listeners");
    const io = this.io;
    io.on("connect", (socket) => {
      console.log("New Socket Connected", socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New Message Recieved,", message);

        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit("message", message);
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
