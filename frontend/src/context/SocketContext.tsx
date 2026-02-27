import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface SocketContextType {
  socket: Socket;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

// Create a single socket instance
const socket = io(BACKEND_URL, {
  autoConnect: false, // We will connect manually in the provider
  reconnection: true,
  reconnectionAttempts: 5,
});

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Only connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      console.log("🟢 Socket Connected:", socket.id);
    };

    const onDisconnect = (reason: string) => {
      console.log("🔴 Socket Disconnected:", reason);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      // We do NOT disconnect the socket here. We want the socket to stay alive 
      // globally as long as the app is running. Disconnecting here would kill the global instance.
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
