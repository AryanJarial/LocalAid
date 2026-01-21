import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { io } from 'socket.io-client';
import Map from '../components/Map';
import TrendBanner from '../components/TrendBanner';
import LandingPage from '../components/LandingPage';
import { Calendar, User } from 'lucide-react';

const getCategoryStyle = (category) => {
  switch (category) {
    case 'Medical':
      return { bg: 'bg-[#FFEBEE]', emoji: '🏥', tag: 'Urgent' };
    case 'Food':
      return { bg: 'bg-[#FFF8E1]', emoji: '🍲', tag: 'Essentials' };
    case 'Education':
      return { bg: 'bg-[#E3F2FD]', emoji: '📚', tag: 'Learning' };
    case 'Tools':
      return { bg: 'bg-[#F3E5F5]', emoji: '🔧', tag: 'Equipment' };
    default:
      return { bg: 'bg-[#E8F5E9]', emoji: '🤝', tag: 'Community' };
  }
};

const Home = () => {
  const { user } = useContext(AuthContext);

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
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
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
          setPosts((prev) => [newPost, ...prev]);
          setIncomingPost(true);
          setTimeout(() => setIncomingPost(false), 3000);
        }
      }
    });

    socket.on("karma-updated", ({ userId, karmaPoints }) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.user?._id === userId
            ? {
              ...post,
              user: {
                ...post.user,
                karmaPoints,
              },
            }
            : post
        )
      );
    });

    return () => socket.disconnect();
  }, [user, filterType]);

  useEffect(() => {
    if (!userLocation) return;
    fetchPosts(userLocation.lat, userLocation.lng);
  }, [userLocation, user]);

  const fetchPosts = async (lat, lng, search, type) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (lat && lng) {
        params.append('lat', lat);
        params.append('lng', lng);
        params.append('dist', 10);
      }
      if (user) params.append('excludeId', user._id);
      if (search) params.append('search', search);
      if (type && type !== 'all') params.append('type', type);

      const { data } = await axios.get(`/api/posts?${params.toString()}`);

      console.log("Fetched Posts:", data);

      setPosts(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (userLocation) fetchPosts(userLocation.lat, userLocation.lng, searchTerm, filterType);
  };

  if (!user) return <LandingPage />;


  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-300 via-teal-200 to-green-200 pt-28">

      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-400 to-teal-300 pb-20 rounded-[3rem] shadow-lg mb-18 mx-4">
        <div className="absolute top-10 left-10 w-24 h-12 bg-white/40 rounded-full blur-sm"></div>
        <div className="absolute top-20 right-20 w-32 h-14 bg-white/30 rounded-full blur-sm"></div>

        <div className="container mx-auto px-4 pt-10 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4 drop-shadow-sm">
              Explore Smarter, <br /> <span className="text-white/90">Connect Further</span>
            </h1>
            <p className="text-xl text-teal-900 mb-6 font-medium">Find local help, offer services, and connect with your community</p>
            {incomingPost && (
              <span className="inline-block bg-red-500 text-white px-4 py-2 rounded-full animate-pulse font-bold shadow-lg">🔔 New Activity Nearby!</span>
            )}
          </div>
          {userLocation && (
            <div className="text-center mb-6">
              <span className="inline-block bg-white/90 text-teal-800 px-6 py-3 rounded-full font-semibold shadow-lg backdrop-blur-sm border border-white/50">
                📍 Your Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" className="w-full h-20 fill-green-200/50">
            <path d="M0,60 L300,20 L600,80 L900,10 L1200,70 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">

        {/* Trend + Search Section */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-stretch min-h-[180px]">

  {/* Trend Banner */}
  <div className="h-full">
    {userLocation && <TrendBanner userLocation={userLocation} />}
  </div>

  {/* Search Bar */}
  <div className="h-37 bg-white/95 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 flex flex-col justify-between">

    <form onSubmit={handleSearch} className="flex flex-col gap-2">

      {/* Search Input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
        <input
          type="text"
          placeholder="Search nearby requests or offers..."
          className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter + Button */}
      <div className="flex gap-3">
        <select
          className="flex-1 px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-bold text-gray-700 cursor-pointer"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">🌍 All</option>
          <option value="request">🔴 Request</option>
          <option value="offer">🟢 Offer</option>
        </select>

        <button
          type="submit"
          className="bg-black text-white font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg"
        >
          Search
        </button>
      </div>

    </form>
  </div>

</div>


        {locationError && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-lg shadow">
            <p className="font-semibold">⚠️ {locationError}</p>
          </div>
        )}

        {userLocation && !loading && (
          <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-66 w-full bg-white">
            <Map posts={posts} userLocation={userLocation} />
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-2xl text-teal-800 font-bold">Scanning area...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center mt-6 p-16 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-teal-300 shadow-lg">
            <div className="text-6xl mb-4 opacity-50">⛺</div>
            <p className="text-2xl text-gray-700 font-bold mb-4">No posts found</p>
            <button onClick={() => { setSearchTerm(''); setFilterType('all'); if (userLocation) fetchPosts(userLocation.lat, userLocation.lng, '', 'all'); }} className="text-teal-600 font-bold hover:underline">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {posts.map((post) => {
              const style = getCategoryStyle(post.category);
              const karma = post.user?.karmaPoints || 0;
              const trustPercentage = Math.min(karma, 100);

              return (
                <div key={post._id} className={`relative p-8 rounded-[2.5rem] ${style.bg} transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group`}>

                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-extrabold text-gray-800 uppercase tracking-wider shadow-sm">
                      {style.tag}
                    </span>
                    <div className="text-6xl filter drop-shadow-md transform rotate-12 group-hover:rotate-6 transition-transform duration-300 cursor-default select-none">
                      {style.emoji}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3 leading-tight">{post.title}</h3>
                    <p className="text-gray-600 font-medium text-sm line-clamp-2 leading-relaxed h-10">{post.description}</p>
                  </div>

                  {/* --- UPDATED: PROFILE PICTURE + BADGES --- */}
                  <div className="flex items-center justify-between mb-6">
                    {/* User Profile Pic & Name */}
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                      <img
                        src={post.user?.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt={post.user?.name || "User"}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <span className="truncate max-w-[100px]">{post.user?.name}</span>
                    </div>

                    {/* Type Badge */}
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${post.type === 'request'
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                      {post.type === 'request' ? '🔴 Requesting' : '🟢 Offering'}
                    </span>
                  </div>

                  {/* Trust Score Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Help Score</span>
                      <span className="text-[10px] font-bold text-gray-500">{karma} Karma</span>
                    </div>
                    <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-black/80 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${trustPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    {user && post.user?._id !== user._id ? (
                      <Link to="/chat" state={{ userId: post.user._id }} className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-transform transform hover:scale-105 shadow-lg flex items-center gap-2">Message</Link>
                    ) : (
                      <span className="bg-white/50 text-gray-400 px-6 py-3 rounded-full font-bold text-sm border border-white/50">You</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;