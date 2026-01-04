// frontend/src/pages/Home.jsx
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { io } from 'socket.io-client';
import Map from '../components/Map';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  const [incomingPost, setIncomingPost] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { user } = useContext(AuthContext); 

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
      },
      (error) => {
        setLocationError('Please enable location access to see posts nearby.');
        setLoading(false);
      }
    );

    const socket = io('http://localhost:5000');

    socket.on('new-post', (newPost) => {
      if (user && newPost.user._id !== user._id) {
         if (filterType === 'all' || newPost.type === filterType) {
            setPosts((prevPosts) => [newPost, ...prevPosts]);
            setIncomingPost(true);
            setTimeout(() => setIncomingPost(false), 3000);
         }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!userLocation) return;
    if (!user) return;

    fetchPosts(userLocation.lat, userLocation.lng);
  }, [userLocation, user]);


  const fetchPosts = async (lat, lng, search, type) => {
    setLoading(true);
    try {
      let url = '/api/posts';
      
      const params = new URLSearchParams();
      if (lat && lng) {
        params.append('lat', lat);
        params.append('lng', lng);
        params.append('dist', 10);
      }
      
      if (user) {
        params.append('excludeId', user._id);
      }

      if (search) params.append('search', search);
      if (type && type !== 'all') params.append('type', type);

      const { data } = await axios.get(`${url}?${params.toString()}`);
      setPosts(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (userLocation) {
      fetchPosts(userLocation.lat, userLocation.lng, searchTerm, filterType);
    }
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
            Nearby Activity
            {incomingPost && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">New!</span>}
        </h1>
        {userLocation && (
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </span>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          
          {/* Search Input */}
          <input 
            type="text" 
            placeholder="Search keywords (e.g., Blood, Plumber)..." 
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Filter Dropdown */}
          <select 
            className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="request">Requests Only</option>
            <option value="offer">Offers Only</option>
          </select>

          {/* Search Button */}
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {locationError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>{locationError}</p>
        </div>
      )}

      {userLocation && !loading && (
        <Map posts={posts} userLocation={userLocation} />
      )}

      {loading ? (
        <p className="text-center text-gray-500">Scanning your area...</p>
      ) : posts.length === 0 ? (
        <div className="text-center mt-10 p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-xl text-gray-600">No posts found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                if(userLocation) fetchPosts(userLocation.lat, userLocation.lng, '', 'all');
              }}
              className="text-blue-500 underline mt-2"
            >
              Clear filters
            </button>
        </div>
      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              <div className={`h-2 w-full ${post.type === 'request' ? 'bg-red-500' : 'bg-green-500'}`}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                        post.type === 'request' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                        {post.type}
                    </span>
                    <span className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.description}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                            {post.user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">{post.user?.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {post.category}
                    </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;