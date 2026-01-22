import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios.js';
import ScrollToBottom from 'react-scroll-to-bottom';
import { io } from 'socket.io-client';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';

const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:5000";
var socket;

const ChatBox = ({ user, selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const selectedChatRef = useRef(null);

  // --- LOGIC: Socket Setup (Unchanged) ---
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    return () => socket.disconnect();
  }, [user]);

  // --- LOGIC: Message Listener (Unchanged) ---
  useEffect(() => {
    const handleMessageReceived = (newMessageReceived) => {
      if (!selectedChatRef.current || selectedChatRef.current._id !== newMessageReceived.conversationId._id) {
        // notification logic would go here
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    };
    socket.on("message received", handleMessageReceived);
    return () => socket.off("message received", handleMessageReceived);
  }, []);

  // --- LOGIC: Fetch Messages (Unchanged) ---
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      selectedChatRef.current = selectedChat;
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`/api/chat/${selectedChat._id}`, config);
        setMessages(data);
        setLoading(false);
        socket.emit("join chat", selectedChat._id);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchMessages();
    clearImage();
  }, [selectedChat, user.token]);

  // --- LOGIC: File Handling (Unchanged) ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- LOGIC: Send Message (Unchanged) ---
  const sendMessage = async (e) => {
    if ((!e || e.key === "Enter" || e.type === "click") && (newMessage || selectedFile)) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        let imageUrl = "";

        if (selectedFile) {
          setIsUploading(true);
          const formData = new FormData();
          formData.append('image', selectedFile);
          const uploadRes = await axios.post('/api/upload/message', formData, config);
          imageUrl = uploadRes.data.imageUrl;
          setIsUploading(false);
        }

        const msgData = {
          conversationId: selectedChat._id,
          text: newMessage,
          image: imageUrl,
        };

        setNewMessage("");
        clearImage();

        const { data } = await axios.post("/api/chat/message", msgData, config);
        setMessages([...messages, data]);
      } catch (error) {
        console.error("Failed to send", error);
        setIsUploading(false);
        alert("Failed to send message");
      }
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-[#23272f]">
        <div className="text-6xl mb-4 opacity-50">💬</div>
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#23272f]">

      {/* --- Chat Area --- */}
      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-blue-400">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        ) : (
          <ScrollToBottom className="h-full w-full px-4 py-4 custom-scrollbar">
            {messages.map((m) => {
              const isMyMessage = m.sender._id === user._id;
              return (
                <div key={m._id} className={`flex mb-4 ${isMyMessage ? "justify-end" : "justify-start"}`}>

                  {!isMyMessage && (
                    <img
                      src={m.sender.profilePicture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                      className="w-8 h-8 rounded-full mr-2 self-end mb-1 border border-gray-600"
                      alt="sender"
                    />
                  )}

                  <div className={`relative px-4 py-2.5 max-w-[75%] shadow-sm ${
                    isMyMessage
                      ? "bg-blue-600 text-white rounded-2xl rounded-br-none" // Dark mode: Solid blue for user
                      : "bg-gray-700 text-gray-200 rounded-2xl rounded-bl-none" // Dark mode: Dark gray for others
                    }`}
                  >
                    {m.image && (
                      <div className="mb-2 overflow-hidden rounded-lg border border-black/20">
                        <img
                          src={m.image}
                          className="max-h-48 w-auto object-contain bg-gray-800"
                          alt="attachment"
                        />
                      </div>
                    )}
                    {m.text && <p className="leading-relaxed text-sm md:text-base break-words">{m.text}</p>}

                    <p className={`text-[10px] mt-1 text-right ${isMyMessage ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </ScrollToBottom>
        )}
      </div>

      {/* --- Input Area --- */}
      <div className="px-6 py-4 bg-[#2a2f38] border-t border-gray-700 relative">

        {/* Image Preview Pop-up */}
        {previewUrl && (
          <div className="absolute bottom-full left-6 mb-3 bg-gray-800 p-2 rounded-lg shadow-xl border border-gray-700">
            <div className="relative">
              <img src={previewUrl} className="h-24 w-auto rounded-md object-cover" alt="Preview" />
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
              >
                <X className="w-3 h-3" />
              </button>
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />

          <button
            onClick={() => fileInputRef.current.click()}
            className="text-gray-400 hover:text-gray-200 p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            title="Attach Image"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all text-gray-200 placeholder-gray-400 text-sm"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(e)}
              disabled={isUploading}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={isUploading || (!newMessage && !selectedFile)}
            className={`p-2.5 rounded-lg transition-all transform hover:scale-105 shadow-md flex items-center justify-center ${
              (newMessage || selectedFile) && !isUploading
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;