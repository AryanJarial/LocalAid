import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ScrollToBottom from 'react-scroll-to-bottom';
import { io } from 'socket.io-client';

const ENDPOINT = "http://localhost:5000"; 
var socket;

const ChatBox = ({ user, selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Image Upload States
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
    if ((e.key === "Enter" || e.type === "click") && (newMessage || selectedFile)) {
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
      }
    }
  };

  if (!selectedChat) {
    return <div className="flex justify-center items-center h-full text-gray-500">Select a chat</div>;
  }

  const otherUser = selectedChat.members.find(m => m._id !== user._id) || selectedChat.members[0];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      
      <div className="bg-gray-100 p-4 border-b flex items-center">
        <img src={otherUser?.profilePicture} className="w-10 h-10 rounded-full mr-3 object-cover"/>
        <h2 className="font-bold text-gray-700">{otherUser?.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? <p className="text-center">Loading...</p> : (
            <ScrollToBottom className="h-full">
                {messages.map((m) => (
                    <div key={m._id} className={`flex mb-4 ${m.sender._id === user._id ? "justify-end" : "justify-start"}`}>
                        <div className={`px-4 py-2 rounded-lg max-w-[75%] ${m.sender._id === user._id ? "bg-blue-600 text-white" : "bg-white border text-gray-800"}`}>
                            {m.image && <img src={m.image} className="max-w-full rounded mb-2"/>}
                            {m.text && <p>{m.text}</p>}
                        </div>
                    </div>
                ))}
            </ScrollToBottom>
        )}
      </div>

      {previewUrl && (
          <div className="px-4 py-2 bg-gray-100 border-t flex items-center relative">
              <img src={previewUrl} className="h-20 w-auto rounded border"/>
              <button onClick={clearImage} className="absolute top-0 left-20 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
              {isUploading && <span className="ml-3 text-blue-600 animate-pulse">Uploading...</span>}
          </div>
      )}

      <div className="p-4 bg-gray-100 border-t flex gap-2 items-center">
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect}/>
        <button onClick={() => fileInputRef.current.click()} className="text-gray-500 hover:text-blue-600 p-2">📎</button>
        <input 
            type="text"
            className="flex-1 p-3 border rounded focus:outline-blue-500"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={sendMessage}
            disabled={isUploading}
        />
        <button onClick={sendMessage} disabled={isUploading} className="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400">
            {isUploading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;