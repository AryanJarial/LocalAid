// frontend/src/pages/Home.jsx
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { io } from 'socket.io-client';
import Map from '../components/Map';
import TrendBanner from '../components/TrendBanner';
import LandingPage from '../components/LandingPage';

const Home = () => {

  const { user } = useContext(AuthContext); 

  if (!user) {
    return <LandingPage />;
  }
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  const [incomingPost, setIncomingPost] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

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
    // if (!user) return;

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
    <div className="min-h-screen bg-gradient-to-b from-cyan-300 via-teal-200 to-green-200 pt-25">
      
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-400 to-teal-300 pb-20">
        <div className="absolute top-10 left-10 w-24 h-12 bg-white/40 rounded-full blur-sm"></div>
        <div className="absolute top-20 right-20 w-32 h-14 bg-white/30 rounded-full blur-sm"></div>
        
        <div className="container mx-auto px-4 pt-16 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              Explore Smarter,
              <br />
              <span className="text-gray-700">Connect Further</span>
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Find local help, offer services, and connect with your community
            </p>
            
            {incomingPost && (
              <span className="inline-block bg-red-500 text-white px-4 py-2 rounded-full animate-pulse font-bold shadow-lg">
                🔔 New Activity Nearby!
              </span>
            )}
          </div>

          {userLocation && (
            <div className="text-center mb-6">
              <span className="inline-block bg-white/90 text-teal-800 px-6 py-3 rounded-full font-semibold shadow-lg backdrop-blur-sm">
                📍 Your Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" className="w-full h-20 fill-green-200">
            <path d="M0,60 L300,20 L600,80 L900,10 L1200,70 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        
        {userLocation && <TrendBanner userLocation={userLocation} />}

        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-2 border-green-300 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            
            <div className="flex-1 relative">
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search keywords (e.g., Hiking, Equipment)..." 
                className="w-full pl-10 pr-4 py-3 border-2 border-teal-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select 
              className="px-4 py-3 border-2 border-teal-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white font-semibold text-gray-700 transition-all cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">🌍 All Types</option>
              <option value="request">🔴 Requests Only</option>
              <option value="offer">🟢 Offers Only</option>
            </select>

            <button 
              type="submit" 
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Search
            </button>
          </form>
        </div>

        {locationError && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-lg shadow animate-fade-in">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <p className="font-semibold">{locationError}</p>
            </div>
          </div>
        )}

        {userLocation && !loading && (
          <Map posts={posts} userLocation={userLocation} />
        )}

        {loading ? (

          <div className="text-center py-20">
            <div className="inline-block animate-bounce text-6xl mb-4">🏔️</div>
            <p className="text-2xl text-teal-700 font-bold">Scanning your area...</p>
          </div>
        ) : posts.length === 0 ? (

          <div className="text-center mt-6 p-16 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-teal-300 shadow-lg">
            <div className="text-6xl mb-4">🏕️</div>
            <p className="text-2xl text-gray-700 font-bold mb-4">No posts found matching your criteria</p>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                if(userLocation) fetchPosts(userLocation.lat, userLocation.lng, '', 'all');
              }}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
            >
              Clear Filters
            </button>
          </div>
        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {posts.map((post) => (
              <div 
                key={post._id} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-green-200 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className={`h-3 w-full ${post.type === 'request' ? 'bg-gradient-to-r from-red-400 to-pink-500' : 'bg-gradient-to-r from-green-400 to-teal-500'}`}></div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase flex items-center gap-1 ${
                      post.type === 'request' 
                        ? 'bg-red-100 text-red-700 border border-red-300' 
                        : 'bg-green-100 text-green-700 border border-green-300'
                    }`}>
                      {post.type === 'request' ? '🔴' : '🟢'}
                      {post.type}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center">
                      <img 
                        src={post.user?.profilePicture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                        className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-gray-200 shadow-sm"
                        alt="User"
                      />
                      <div>
                        <span className="text-sm font-bold block text-gray-800">{post.user?.name}</span>
                        
                        {user && post.user?._id !== user._id && (
                          <Link 
                            to="/chat" 
                            state={{ userId: post.user._id }} 
                            className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 hover:underline mt-1"
                          >
                            💬 Message
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;