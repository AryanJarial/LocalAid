import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios.js';
import AuthContext from '../context/AuthContext';
// 1. Import Loader Icon
import { Loader2 } from 'lucide-react';

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

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  // 2. Add Loading State
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 4) {
      setError('You can upload max 4 images');
      return;
    }

    setImages(prev => [...prev, ...files]);

    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...previews]);
  };

  const uploadImages = async (token) => {
    if (images.length === 0) return [];

    const formData = new FormData();
    images.forEach(img => formData.append('images', img));

    const { data } = await axios.post('/api/upload/post-images', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return data.images;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!location.lat || !location.lng) {
      setError('Location is required to create a post.');
      return;
    }

    // 3. Start Loading
    setIsSubmitting(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const token = userInfo?.token;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const uploadedImages = await uploadImages(token);

      const postData = {
        title,
        description,
        type,
        category,
        latitude: location.lat,
        longitude: location.lng,
        images: uploadedImages,
      };

      await axios.post('/api/posts', postData, config);

      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create post');
      // 4. Stop Loading on Error
      setIsSubmitting(false);
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

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Add Images (Max 4 Images)
              </label>

              <div className="flex items-center gap-3">
                <label className="flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-purple-200 rounded-2xl bg-purple-50/50 cursor-pointer hover:bg-purple-100 hover:border-purple-400 transition-all duration-300 group">
                  <div className="text-purple-500 group-hover:scale-110 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                <div className="flex gap-3 overflow-x-auto py-1 px-1 no-scrollbar">
                  {previewImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white shadow-md transform hover:rotate-2 transition-all"
                    >
                      <img
                        src={img}
                        alt={`upload-${i}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  ))}
                </div>
              </div>

              {previewImages.length > 0 && (
                <p className="text-[9px] text-gray-400 font-medium italic ml-1">
                  {previewImages.length} images selected
                </p>
              )}
            </div>

            <div className={`p-2 rounded-lg border flex items-center gap-3 transition-colors ${location.lat ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${location.lat ? 'bg-green-100' : 'bg-yellow-100 animate-pulse'
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

            {/* 5. Updated Button with Loading State */}
            <button
              type="submit"
              className={`w-full text-white py-3 rounded-xl font-bold text-sm transition-all transform flex items-center justify-center gap-2 shadow-md ${location.lat && !isSubmitting
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02]'
                : 'bg-gray-300 cursor-not-allowed'
                }`}
              disabled={!location.lat || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                location.lat ? '🚀 Post Now' : '⏳ Waiting...'
              )}
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