import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const CreatePost = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('request'); 
  const [category, setCategory] = useState('General');
  
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const [locationStatus, setLocationStatus] = useState('Getting location...');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('Location detected!');
      },
      (error) => {
        setLocationStatus('Unable to retrieve location. Please allow access.');
        console.error(error);
      }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!location.lat || !location.lng) {
      setError('Location is required to create a post.');
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const token = userInfo?.token;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      };

      const postData = {
        title,
        description,
        type,
        category,
        latitude: location.lat,
        longitude: location.lng,
      };

      await axios.post('/api/posts', postData, config);

      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create post');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center pt-24 pb-4 px-4 overflow-hidden">
      
      <div className="w-full max-w-5xl h-full max-h-[600px] grid md:grid-cols-2 gap-4 items-center">
        
        <div className="bg-white rounded-3xl shadow-2xl p-6 h-full flex flex-col justify-center relative animate-fade-in-up">
          
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-6 bg-purple-600 rounded"></div>
              <span className="font-bold text-gray-800 text-lg">LocalAid</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Create Post</h2>
          </div>
          
          {error && <div className="bg-red-50 text-red-700 p-2 mb-2 rounded text-xs">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3">
            
            <div>
              <label className="block text-gray-600 font-bold mb-1 text-xs uppercase">Title</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg focus:bg-white focus:border-purple-500 focus:outline-none transition-all text-sm"
                placeholder="e.g., Need O-ve Blood"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 font-bold mb-1 text-xs uppercase">Description</label>
              <textarea
                className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg focus:bg-white focus:border-purple-500 focus:outline-none transition-all resize-none text-sm h-20"
                placeholder="Details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-gray-600 font-bold mb-1 text-xs uppercase">Type</label>
                    <select
                        className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg focus:bg-white focus:border-purple-500 focus:outline-none text-sm cursor-pointer"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="request">🔴 Request</option>
                        <option value="offer">🟢 Offer</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-600 font-bold mb-1 text-xs uppercase">Category</label>
                    <select
                        className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg focus:bg-white focus:border-purple-500 focus:outline-none text-sm cursor-pointer"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="General">🌐 General</option>
                        <option value="Medical">🏥 Medical</option>
                        <option value="Food">🍽️ Food</option>
                        <option value="Education">📚 Education</option>
                        <option value="Tools">🔧 Tools</option>
                    </select>
                </div>
            </div>

            <div className={`p-2 rounded-lg border flex items-center gap-3 transition-colors ${
                location.lat ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                  location.lat ? 'bg-green-100' : 'bg-yellow-100 animate-pulse'
              }`}>
                  {location.lat ? '📍' : '📡'}
              </div>
              <div className="flex-1">
                  <p className="font-bold text-gray-700 text-xs">
                    {location.lat ? 'Location Locked' : 'Detecting...'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {location.lat ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : locationStatus}
                  </p>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full text-white py-3 rounded-xl font-bold text-sm transition-all transform flex items-center justify-center gap-2 shadow-md ${
                location.lat 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02]' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
              disabled={!location.lat}
            >
              {location.lat ? '🚀 Post Now' : '⏳ Waiting...'}
            </button>

          </form>
        </div>

        <div className="hidden md:block h-full relative">
           <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                <img 
                    src="/createPost.png" 
                    alt="Community Help" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20 text-white">
                    <h3 className="text-2xl font-bold mb-1">Stronger Together.</h3>
                    <p className="text-white/80 text-sm">Help your neighbors today.</p>
                </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default CreatePost;