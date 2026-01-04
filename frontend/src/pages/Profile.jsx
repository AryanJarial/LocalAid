import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div>
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-600 mt-2"><strong>Name:</strong> {user.name}</p>
            <p className="text-gray-600"><strong>Email:</strong> {user.email}</p>
            <span className="inline-block mt-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded uppercase font-bold">
                Role: {user.role}
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
                
                <button 
                    onClick={() => handleDelete(post._id)}
                    className="text-red-500 hover:text-red-700 text-sm font-bold border border-red-200 hover:border-red-500 px-3 py-1 rounded transition-colors"
                >
                    Delete
                </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;