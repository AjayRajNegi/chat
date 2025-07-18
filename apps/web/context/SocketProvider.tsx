"use client";

import { io, Socket } from "socket.io-client";
import React, { useCallback, useEffect, useContext, useState } from "react";

interface SocketProviderProps {
  children?: React.ReactNode;
}

// Shape of your context
interface ISocketContext {
  sendMessage: (msg: string) => any; // Function to emit a message to the server
  // Array of all messages received from the server
  messages: string[];
}

// Use this context to pass down sendMessage and messages to any component
const SocketContext = React.createContext<ISocketContext | null>(null);

// Custom hook for consuming the SocketContext
export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error("State is undefined");
  return state;
};

// Component wraps your app to provide socket functionality via context
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<string[]>([]);

  // This function emits an event:message to the server
  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg) => {
      console.log("Send message", msg);
      if (socket) {
        socket.emit("event:message", { message: msg });
      }
    },
    [socket]
  );

  // Handles incoming messages form the server
  // Adds the new message to the messages state array
  const onMessageRec = useCallback((msg: string) => {
    console.log("From Server Message Recieved", msg);
    const { message } = JSON.parse(msg) as { message: string };
    setMessages((prev) => [...prev, message]);
  }, []);

  // Connec to your backend
  // Listens for the message event and calls onMessageRec
  useEffect(() => {
    const _socket = io("http://localhost:8000");
    _socket.on("message", onMessageRec);
    setSocket(_socket);

    // Disconnets the socket
    // Removes the event listener to prevent memory leaks
    return () => {
      _socket.disconnect();
      _socket.off("message", onMessageRec);
    };
  }, []);
  return (
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};
