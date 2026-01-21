import { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from "socket.io-client";
import AuthContext from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { Search, ArrowLeft } from 'lucide-react';

const ENDPOINT = "http://localhost:5000";

const ChatPage = () => {
  // 1. Get activeChatRef from Context
  const { user, notification, setNotification, activeChatRef } = useContext(AuthContext);
  const location = useLocation();
  
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const hasFetchedRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. CLEANUP: Reset activeChatRef when leaving the ChatPage
  useEffect(() => {
    return () => {
      if (activeChatRef) activeChatRef.current = null;
    };
  }, []);

  // --- Fetch Chats ---
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get("/api/chat", config);
        setChats(data);
      } catch (error) {
        console.error("Failed to load chats");
      }
    };
    if (user) fetchChats();
  }, [user]);

  // --- Start Chat Logic ---
  useEffect(() => {
    const startChat = async () => {
      if (location.state && location.state.userId) {
        if (hasFetchedRef.current) return; 
        hasFetchedRef.current = true;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('/api/chat', { userId: location.state.userId }, config);
            
            setChats((prev) => {
                 if (!prev.find(c => c._id === data._id)) return [data, ...prev];
                 return prev;
            });
            
            // 3. Update Ref when auto-starting a chat
            setSelectedChat(data);
            activeChatRef.current = data._id; 
            
            window.history.replaceState({}, document.title);
        } catch (error) {
            console.error("Error creating chat:", error);
            hasFetchedRef.current = false;
        }
      }
    };
    if (user) startChat();
  }, [location.state, user]); 

  // --- Handle Chat Selection ---
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    
    // 4. Update Global Ref so AuthContext knows this chat is open
    activeChatRef.current = chat._id;

    // Clear existing notifications for this chat
    setNotification(
      notification.filter((n) => {
        const notifChatId = n.chat?._id || n.conversationId?._id || n.chat || n.conversationId;
        return notifChatId !== chat._id;
      })
    );
  };

  // --- Listen for Sidebar Updates ---
  useEffect(() => {
    if (!user) return;
    const socket = io(ENDPOINT);
    socket.emit("setup", user);

    socket.on("message received", (newMessageReceived) => {
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat._id === newMessageReceived.conversationId._id || chat._id === newMessageReceived.conversationId) {
             return {
               ...chat,
               latestMessage: newMessageReceived,
               updatedAt: new Date().toISOString(),
             };
          }
          return chat;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });

    return () => socket.disconnect();
  }, [user]);

  const getSenderInfo = (loggedUser, members) => {
    if (!members || members.length === 0) return null;
    return members.find(m => m._id !== loggedUser._id) || members[0];
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  const filteredChats = chats.filter(chat => {
    const otherUser = getSenderInfo(user, chat.members);
    return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!user) return <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-400">Please login to chat.</div>;

  return (
    <div className="h-screen bg-gray-900 pt-20 pb-4 px-4 box-border">
      <div className="flex h-full bg-gray-900 overflow-hidden rounded-2xl border border-gray-800 shadow-2xl">
      
        {/* --- LEFT SIDEBAR --- */}
        <div className={`w-full md:w-96 bg-[#1a1d24] border-r border-gray-800 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-800">
                <h2 className="text-xl font-bold text-gray-200 mb-4 px-2">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600 transition-all text-sm text-gray-300 placeholder-gray-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <p>No conversations found.</p>
                    </div>
                ) : (
                    filteredChats.map((chat) => {
                        const otherUser = getSenderInfo(user, chat.members);
                        const isSelected = selectedChat?._id === chat._id;
                        
                        const unreadCount = notification.filter(n => {
                           const notifChatId = n.chat?._id || n.conversationId?._id || n.chat || n.conversationId;
                           return notifChatId === chat._id;
                        }).length;
                        
                        return (
                            <div 
                                key={chat._id}
                                onClick={() => handleChatSelect(chat)}
                                className={`flex items-start p-4 cursor-pointer transition-all border-b border-gray-800/50 hover:bg-gray-800/50 ${
                                    isSelected ? 'bg-gray-800/80 border-l-4 border-l-blue-500 pl-3' : 'border-l-4 border-l-transparent'
                                }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <img 
                                        src={otherUser?.profilePicture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                                        alt={otherUser?.name} 
                                        className="w-12 h-12 rounded-full object-cover border border-gray-700"
                                    />
                                </div>

                                <div className="flex-1 ml-3 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className={`text-sm truncate ${isSelected || unreadCount > 0 ? 'font-bold text-gray-100' : 'font-semibold text-gray-300'}`}>
                                            {otherUser?.name}
                                        </h4>
                                        <span className={`text-xs flex-shrink-0 ${unreadCount > 0 ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                                            {getTimeAgo(chat.latestMessage?.createdAt || chat.updatedAt)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <p className={`text-xs truncate max-w-[180px] ${unreadCount > 0 ? 'text-gray-200 font-bold' : 'text-gray-500'}`}>
                                            {chat.latestMessage ? (
                                                <>
                                                    {chat.latestMessage.sender === user._id ? <span className="text-blue-400">You: </span> : ""}
                                                    {chat.latestMessage.text || <span className="italic">Sent an attachment</span>}
                                                </>
                                            ) : (
                                                <span className="italic">Start a conversation</span>
                                            )}
                                        </p>
                                        {unreadCount > 0 && (
                                            <span className="ml-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>

        {/* --- MAIN CHAT AREA (Unchanged) --- */}
        <div className={`flex-1 flex flex-col bg-[#23272f] ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedChat ? (
                <>
                    <div className="px-6 py-3 border-b border-gray-700 bg-[#2a2f38] flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center">
                            <button 
                                onClick={() => { setSelectedChat(null); activeChatRef.current = null; }} 
                                className="md:hidden mr-3 text-gray-400 hover:text-gray-200 bg-gray-700/50 p-2 rounded-lg"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            
                            <div className="flex items-center gap-3">
                                <img 
                                    src={getSenderInfo(user, selectedChat.members)?.profilePicture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                                    className="w-10 h-10 rounded-full object-cover border border-gray-600" 
                                    alt="User"
                                />
                                <div>
                                    <h3 className="font-bold text-gray-200 text-base leading-tight">
                                        {getSenderInfo(user, selectedChat.members)?.name}
                                    </h3>
                                    <p className="text-xs text-gray-500">Active now</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative bg-[#23272f]">
                        <ChatBox user={user} selectedChat={selectedChat} />
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#23272f] text-center p-8">
                    <div className="w-24 h-24 bg-gray-700/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <span className="text-5xl">💬</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-200 mb-2">Welcome to Messages</h2>
                    <p className="text-gray-500 max-w-sm">
                        Select a conversation from the sidebar to start chatting or search for a user to connect with.
                    </p>
                </div>
            )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #5a6578; }
      `}</style>
    </div>
  );
};

export default ChatPage;