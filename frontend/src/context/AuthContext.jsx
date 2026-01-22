import { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const AuthContext = createContext();
const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState([]);

  const activeChatRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      const socket = io(ENDPOINT);
      socket.emit("setup", user);

      socket.on("message received", (newMessageReceived) => {
        if (!newMessageReceived.sender || newMessageReceived.sender._id === user._id) {
            return;
        }

        const msgChatId = newMessageReceived.chat?._id || newMessageReceived.chat || 
                          newMessageReceived.conversationId?._id || newMessageReceived.conversationId;

        if (activeChatRef.current === msgChatId) {
            return; 
        }

        setNotification((prev) => [newMessageReceived, ...prev]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post("/api/users/login", { email, password });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed" 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post("/api/users/register", { name, email, password });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Registration failed" 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setNotification([]);
    activeChatRef.current = null;
    window.location.href = '/';
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, notification, setNotification, activeChatRef }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 