import { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { Search, Phone, MoreVertical } from 'lucide-react';

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const hasFetchedRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');

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
            setSelectedChat(data);
            window.history.replaceState({}, document.title);
        } catch (error) {
            console.error("Error creating chat:", error);
            hasFetchedRef.current = false;
        }
      }
    };
    if (user) startChat();
  }, [location.state, user]); 

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

  if (!user) return <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-500">Please login to chat.</div>;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50 overflow-hidden">
      
      <div className={`w-full md:w-96 bg-white border-r border-gray-200 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        
        <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <p>No conversations found.</p>
                </div>
            ) : (
                filteredChats
                .filter((chat, index, self) => 
                    index === self.findIndex((c) => (
                        getSenderInfo(user, c.members)._id === getSenderInfo(user, chat.members)._id
                    ))
                )
                .map((chat) => {
                    const otherUser = getSenderInfo(user, chat.members);
                    const isSelected = selectedChat?._id === chat._id;
                    
                    return (
                        <div 
                            key={chat._id}
                            onClick={() => setSelectedChat(chat)}
                            className={`flex items-start p-4 cursor-pointer transition-all border-b border-gray-50 hover:bg-gray-50 ${
                                isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500 pl-3' : 'border-l-4 border-l-transparent'
                            }`}
                        >
                            <div className="relative flex-shrink-0">
                                <img 
                                    src={otherUser?.profilePicture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                                    alt={otherUser?.name} 
                                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                />
                            </div>

                            <div className="flex-1 ml-3 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className={`text-sm truncate ${isSelected ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                        {otherUser?.name}
                                    </h4>
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                        {getTimeAgo(chat.latestMessage?.createdAt || chat.updatedAt)}
                                    </span>
                                </div>
                                
                                <p className={`text-xs truncate ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                                    {chat.latestMessage ? (
                                        <>
                                            {chat.latestMessage.sender === user._id ? <span className="text-blue-500 font-medium">You: </span> : ""}
                                            {chat.latestMessage.text ? chat.latestMessage.text : <span className="italic">Sent an attachment</span>}
                                        </>
                                    ) : (
                                        <span className="italic">Start a conversation</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-white ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
            <>
                <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center">
                        <button 
                            onClick={() => setSelectedChat(null)} 
                            className="md:hidden mr-3 text-gray-500 hover:text-gray-700 bg-gray-100 p-2 rounded-full"
                        >
                            ←
                        </button>
                        
                        <div className="flex items-center gap-3">
                            <img 
                                src={getSenderInfo(user, selectedChat.members)?.profilePicture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                                className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                            />
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg leading-tight">
                                    {getSenderInfo(user, selectedChat.members)?.name}
                                </h3>
                                
                            </div>
                        </div>
                    </div>
                    
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <ChatBox user={user} selectedChat={selectedChat} />
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <span className="text-5xl">💬</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Messages</h2>
                <p className="text-gray-500 max-w-sm">
                    Select a conversation from the sidebar to start chatting or search for a user to connect with.
                </p>
            </div>
        )}
      </div>

    </div>
  );
};

export default ChatPage;
