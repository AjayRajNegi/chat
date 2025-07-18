import Redis from "ioredis"; // Redis client for Node.js
import { Server } from "socket.io"; // Represents the main Socket.IO server instance

// Creates a publisher client
// Publish messages to a Redis channel ("MESSAGES")
const pub = new Redis({
  host: "redis-17239.c264.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 17239,
  username: "default",
  password: "GrNN8pWlDBDZLtGUTGRkS28LKLOPuO6O",
});

// Creates a Redis subscriber client
// Subscribe to channels and react when messages are published
const sub = new Redis({
  host: "redis-17239.c264.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 17239,
  username: "default",
  password: "GrNN8pWlDBDZLtGUTGRkS28LKLOPuO6O",
});

// Class SocketService which encapsulates all socket-related logic
class SocketService {
  // Private variable _io of type Server
  // Server is the main WebSocket server that listens for connections and events
  private _io: Server;

  // Called when we create an instance of SocketService
  constructor() {
    console.log("Init Socket Server");

    // Initializes actual Socket.IO server and stores it in _io
    this._io = new Server({
      cors: {
        allowedHeaders: "*",
        origin: "*",
      },
    });

    //Subscribe the Redis sub client to the "MESSAGES" channel
    sub.subscribe("MESSAGES");
  }

  // Method defines how the server reacts to events
  // Defines all socket event handling logic
  public initListeners() {
    console.log("Init Socket Listeners");

    // Assigns the io getter to a local variable
    const io = this.io;

    // Listens for new client connection
    // Callback provides a socket object representing the connected client
    io.on("connect", (socket) => {
      console.log("New Socket Connected", socket.id);

      // Listens for a custom event named event:mesage sent from the frontend
      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New Message Recieved,", message);

        // Publishes that message to the Redis MESSAGES channel using the pub client
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    // Listens for any message from the sub client
    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit("message", message);
      }
    });
  }

  // Returns the internal _io instance
  get io() {
    return this._io;
  }
}

export default SocketService;
