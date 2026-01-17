import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ScrollToBottom from 'react-scroll-to-bottom';
import { io } from 'socket.io-client';
import { Send, Paperclip, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const ENDPOINT = "http://localhost:5000";
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

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    const handleMessageReceived = (newMessageReceived) => {
      if (!selectedChatRef.current || selectedChatRef.current._id !== newMessageReceived.conversationId._id) {
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    };
    socket.on("message received", handleMessageReceived);
    return () => socket.off("message received", handleMessageReceived);
  }, []);

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
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="text-6xl mb-4">💬</div>
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">

      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-blue-500">
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
                      className="w-8 h-8 rounded-full mr-2 self-end mb-1 border border-gray-200"
                      alt="sender"
                    />
                  )}

                  <div className={`relative px-4 py-2.5 max-w-[75%] shadow-sm ${isMyMessage
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl rounded-br-none"
                      : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-none"
                    }`}>
                    {m.image && (
                      <div className="mb-2 overflow-hidden rounded-lg border border-black/10">
                        <img
                          src={m.image}
                          className="max-h-48 w-auto object-contain bg-gray-100"
                          alt="attachment"
                        />
                      </div>
                    )}
                    {m.text && <p className="leading-relaxed text-sm md:text-base break-words">{m.text}</p>}

                    <p className={`text-[10px] mt-1 text-right ${isMyMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </ScrollToBottom>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 relative">

        {previewUrl && (
          <div className="absolute bottom-full left-4 mb-2 bg-white p-2 rounded-lg shadow-lg border border-gray-200 animate-fade-in-up">
            <div className="relative">
              <img src={previewUrl} className="h-24 w-auto rounded-md object-cover" />
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

        <div className="flex items-end gap-2">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />

          <button
            onClick={() => fileInputRef.current.click()}
            className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Attach Image"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-gray-100 rounded-3xl flex items-center px-4 py-1 focus-within:ring-2 focus-within:ring-blue-300 focus-within:bg-white transition-all">
            <input
              type="text"
              className="flex-1 bg-transparent py-3 border-none focus:ring-0 text-gray-700 placeholder-gray-400"
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
            className={`p-3 rounded-full transition-all transform hover:scale-105 shadow-md flex items-center justify-center ${(newMessage || selectedFile) && !isUploading
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
