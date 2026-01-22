import { useState, useEffect, useContext } from 'react';
import axios from '../api/axios.js';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, Camera, Trash2, CheckCircle, Clock, Edit3, Award, TrendingUp } from 'lucide-react';

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPost, setTargetPost] = useState(null); 
  const [chatContacts, setChatContacts] = useState([]); 
  const [selectedHelper, setSelectedHelper] = useState("");

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`, 
          },
        };
        const { data } = await axios.get('/api/posts/me', config);
        setMyPosts(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    if (user) {
      fetchMyPosts();
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/chat', config);
      
      const contacts = data.map(chat => {
        return chat.members.find(m => m._id !== user._id) || chat.members[0];
      });
      
      const uniqueContacts = [...new Map(contacts.map(item => [item['_id'], item])).values()];
      
      setChatContacts(uniqueContacts);
    } catch (error) {
      console.error("Failed to load contacts", error);
    }
  };

  const openFulfillModal = (post) => {
    setTargetPost(post);
    setIsModalOpen(true);
    fetchContacts(); 
  };

  const submitFulfillment = async () => {
    if (!selectedHelper) return alert("Please select who helped you!");

    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        await axios.put(
            `/api/posts/${targetPost._id}/fulfill`, 
            { helperId: selectedHelper }, 
            config
        );

        const updatedPosts = myPosts.map((p) => 
            p._id === targetPost._id ? { ...p, status: 'fulfilled', fulfilledBy: selectedHelper } : p
        );
        setMyPosts(updatedPosts);
        
        setIsModalOpen(false);
        setTargetPost(null);
        setSelectedHelper("");
        alert("Post marked as completed! 10 Karma points awarded.");

    } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post('/api/upload/profile', formData, config);
      
      const updatedUser = { ...user, profilePicture: data.imageUrl };
      updateUser(updatedUser); 
      
      setUploading(false);
      alert('Profile Picture Updated!');
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert('Image upload failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        await axios.delete(`/api/posts/${id}`, config);
        
        setMyPosts(myPosts.filter((post) => post._id !== id));
      } catch (error) {
        alert(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  if (!user) {
    return <p className="text-center mt-10">Please login to view profile.</p>;
  }

  const stats = {
    totalPosts: myPosts.length,
    completedPosts: myPosts.filter(p => p.status === 'fulfilled').length,
    activePosts: myPosts.filter(p => p.status === 'open' || p.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 font-sans">
      
      <div className="relative h-48 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)', backgroundSize: '30px 30px'}}></div>
      </div>

      <div className="container mx-auto px-4 -mt-24 pb-10 relative z-10">
        
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-purple-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full md:w-auto">
              
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-teal-500 p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden">
                      <img 
                        src={user.profilePicture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                  </div>
                </div>
                
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300">
                  <div className="flex flex-col items-center">
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-[10px] text-white font-bold uppercase">{uploading ? '...' : 'Edit'}</span>
                  </div>
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*"/>
                </label>

                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 border-2 border-white">
                  <Award className="w-3 h-3" />
                  {user.karmaPoints}
                </div>
              </div>

              <div className="text-center md:text-left">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  {user.name}
                </h1>
                <p className="text-gray-500 font-medium mb-3 flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {user.email}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs px-4 py-2 rounded-full font-bold tracking-wide border border-purple-100">
                    <Award className="w-3.5 h-3.5" />
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={logout} 
              className="bg-white hover:bg-red-50 text-red-500 font-bold px-6 py-3 rounded-xl transition-all border-2 border-red-100 hover:border-red-200 hover:shadow-lg flex items-center gap-2 group w-full md:w-auto justify-center"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-semibold mb-1 uppercase tracking-wide">Total Posts</p>
                  <p className="text-3xl font-extrabold text-blue-800">{stats.totalPosts}</p>
                </div>
                <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center shadow-sm">
                  <Edit3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-semibold mb-1 uppercase tracking-wide">Completed</p>
                  <p className="text-3xl font-extrabold text-green-800">{stats.completedPosts}</p>
                </div>
                <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-semibold mb-1 uppercase tracking-wide">Active</p>
                  <p className="text-3xl font-extrabold text-orange-800">{stats.activePosts}</p>
                </div>
                <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-1.5 h-8 bg-gradient-to-b from-purple-600 to-teal-600 rounded-full"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">My Activity</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 absolute top-0"></div>
            </div>
          </div>
        ) : myPosts.length === 0 ? (
          <div className="text-center bg-white p-16 rounded-3xl border-2 border-dashed border-purple-200 shadow-sm">
            <div className="text-7xl mb-4">📭</div>
            <p className="text-gray-700 text-xl font-bold mb-2">No posts yet</p>
            <p className="text-gray-400 mb-8">Start helping your community today!</p>
            <Link 
              to="/create-post" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>+</span> Create First Post
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {myPosts.map((post) => (
              <div 
                key={post._id} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-purple-200 overflow-hidden group"
              >
                <div className={`h-1.5 w-full ${
                  post.status === 'fulfilled' 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                    : 'bg-gradient-to-r from-orange-400 to-amber-500'
                }`}></div>
                
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {post.status === 'fulfilled' ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide border border-green-200">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide border border-blue-200">
                          <Clock className="w-3 h-3" /> Active
                        </span>
                      )}

                      <span className={`inline-flex items-center text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide border ${
                        post.type === 'request' 
                          ? 'text-red-600 bg-red-50 border-red-100' 
                          : 'text-green-600 bg-green-50 border-green-100'
                      }`}>
                        {post.type === 'request' ? '🔴 Request' : '🟢 Offer'}
                      </span>
                      
                      <span className="text-gray-400 text-[10px] font-bold bg-gray-50 px-2.5 py-1 rounded-full">
                        📅 {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed max-w-2xl">
                      {post.description}
                    </p>
                  </div>
                  
                  <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                    {post.status === 'open' && (
                      <button 
                        onClick={() => openFulfillModal(post)}
                        className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </button>
                    )}

                    <button 
                      onClick={() => handleDelete(post._id)}
                      className="text-gray-400 hover:text-red-600 p-3 rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                      title="Delete Post"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all scale-100 animate-slideUp overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-teal-600 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">Award Karma</h3>
                <p className="text-purple-100 text-sm">Who helped you with this request?</p>
              </div>

              <div className="p-6">
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg mb-6">
                  <p className="text-sm text-gray-700">
                    Select the neighbor who helped with <strong className="text-purple-700">"{targetPost?.title}"</strong>. 
                    They'll receive <span className="inline-flex items-center gap-1 text-yellow-600 font-bold bg-yellow-50 px-1 rounded">+10 Karma</span>!
                  </p>
                </div>

                <div className="max-h-60 overflow-y-auto border-2 border-gray-100 rounded-2xl mb-6 bg-gray-50 custom-scrollbar">
                  {chatContacts.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-4xl mb-3">💬</div>
                      <p className="text-gray-600 text-sm font-semibold mb-1">No recent chats</p>
                      <p className="text-xs text-gray-400">You need to chat with someone first.</p>
                    </div>
                  ) : (
                    chatContacts.map(contact => (
                      <div 
                        key={contact._id} 
                        onClick={() => setSelectedHelper(contact._id)}
                        className={`flex items-center p-4 cursor-pointer border-b border-gray-100 last:border-0 transition-all ${
                          selectedHelper === contact._id 
                            ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-l-purple-500 pl-3' 
                            : 'hover:bg-white'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full mr-3 border-2 flex items-center justify-center transition-all ${
                          selectedHelper === contact._id ? 'border-purple-500 bg-purple-500' : 'border-gray-300 bg-white'
                        }`}>
                          {selectedHelper === contact._id && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        
                        <img 
                            src={contact.profilePicture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                            className="w-10 h-10 rounded-full mr-3 object-cover shadow-sm border border-gray-200" 
                            alt="User"
                        />
                        
                        <span className={`font-semibold ${selectedHelper === contact._id ? 'text-purple-700' : 'text-gray-700'}`}>
                            {contact.name}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-5 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all border-2 border-gray-100 hover:border-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitFulfillment}
                    disabled={!selectedHelper}
                    className={`flex-1 px-6 py-3 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                      !selectedHelper 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    Award
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;