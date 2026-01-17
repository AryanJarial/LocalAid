import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPost, setTargetPost] = useState(null); // The post being completed
  const [chatContacts, setChatContacts] = useState([]); // People to choose from
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
      
      // Extract the *other* person from each chat conversation
      const contacts = data.map(chat => {
        return chat.members.find(m => m._id !== user._id) || chat.members[0];
      });
      
      // Remove duplicates (unique users)
      const uniqueContacts = [...new Map(contacts.map(item => [item['_id'], item])).values()];
      
      setChatContacts(uniqueContacts);
    } catch (error) {
      console.error("Failed to load contacts", error);
    }
  };

  // 3. Handle Opening the Modal
  const openFulfillModal = (post) => {
    setTargetPost(post);
    setIsModalOpen(true);
    fetchContacts(); // Load the list of people
  };

  // 4. Handle Submitting the Completion
  const submitFulfillment = async () => {
    if (!selectedHelper) return alert("Please select who helped you!");

    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        // Call the API from Step 6.2
        const { data } = await axios.put(
            `/api/posts/${targetPost._id}/fulfill`, 
            { helperId: selectedHelper }, 
            config
        );

        // Update Local State (UI)
        const updatedPosts = myPosts.map((p) => 
            p._id === targetPost._id ? { ...p, status: 'fulfilled', fulfilledBy: selectedHelper } : p
        );
        setMyPosts(updatedPosts);
        
        // Close Modal
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

  return (
    <div className="container mx-auto mt-10 px-4">
      
      <div className="bg-white p-6 rounded shadow-md mb-8 flex justify-between items-center">
        <div className="relative group">
            <img 
                src={user.profilePicture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
            />
            <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                {uploading ? '...' : 'Change'}
                <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleImageUpload} 
                    accept="image/*"
                />
            </label>
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-600 mt-2"><strong>Name:</strong> {user.name}</p>
            <p className="text-gray-600"><strong>Email:</strong> {user.email}</p>
            <span className="inline-block mt-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded uppercase font-bold">
                Role: {user.role}
            </span>
            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded uppercase font-bold">
              Karma: {user.karmaPoints}
            </span>
        </div>
        <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Logout
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Activity</h2>
      
      {loading ? (
        <p>Loading your posts...</p>
      ) : myPosts.length === 0 ? (
        <div className="text-center bg-gray-50 p-8 rounded border border-dashed border-gray-300">
            <p className="text-gray-500">You haven't posted anything yet.</p>
            <Link to="/create-post" className="text-blue-500 underline mt-2 inline-block">Create your first post</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myPosts.map((post) => (
            <div key={post._id} className="bg-white p-4 rounded shadow-sm border border-gray-200 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                      {post.status === 'fulfilled' ? (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-bold">✓ COMPLETED</span>
                        ) : (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-bold">OPEN</span>
                        )}

                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                            post.type === 'request' ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'
                        }`}>
                            {post.type}
                        </span>
                        <span className="text-gray-400 text-xs">
                             {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <h3 className="font-bold text-lg">{post.title}</h3>
                    <p className="text-gray-600 text-sm truncate w-64 sm:w-96">{post.description}</p>
                </div>
                
                <div className="flex gap-3">
                    {/* MARK COMPLETED BUTTON (Only for open posts) */}
                    {post.status === 'open' && (
                        <button 
                            onClick={() => openFulfillModal(post)}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-3 py-1 rounded transition-colors"
                        >
                            Mark Completed
                        </button>
                    )}

                    <button 
                        onClick={() => handleDelete(post._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold border border-red-200 hover:border-red-500 px-3 py-1 rounded transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                  <h3 className="text-xl font-bold mb-2">Who helped you?</h3>
                  <p className="text-sm text-gray-600 mb-4">Select the user who helped you with <strong>"{targetPost?.title}"</strong>. They will receive +10 Karma points.</p>

                  {/* Helper List */}
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded mb-4">
                      {chatContacts.length === 0 ? (
                          <p className="p-4 text-center text-gray-500 text-sm">No recent chat contacts found.</p>
                      ) : (
                          chatContacts.map(contact => (
                              <div 
                                key={contact._id} 
                                onClick={() => setSelectedHelper(contact._id)}
                                className={`flex items-center p-3 cursor-pointer border-b hover:bg-gray-50 ${selectedHelper === contact._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                              >
                                  <img src={contact.profilePicture} className="w-8 h-8 rounded-full mr-3 object-cover" alt="User"/>
                                  <span className="font-semibold text-gray-700">{contact.name}</span>
                              </div>
                          ))
                      )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={submitFulfillment}
                        disabled={!selectedHelper}
                        className={`px-4 py-2 rounded text-white font-bold ${!selectedHelper ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                          Confirm & Award Karma
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Profile;