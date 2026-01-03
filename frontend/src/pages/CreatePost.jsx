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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Post</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Title</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="e.g., Need O-ve Blood urgently"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded h-24"
            placeholder="Describe what you need or what you are offering..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Type</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="request">Request (I need help)</option>
            <option value="offer">Offer (I want to help)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Category</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="General">General</option>
            <option value="Medical">Medical / Blood</option>
            <option value="Food">Food / Rations</option>
            <option value="Education">Education / Books</option>
            <option value="Tools">Tools / Equipment</option>
          </select>
        </div>

        <div className="mb-6 p-3 bg-gray-100 rounded text-sm text-gray-600">
          📍 Status: <strong>{locationStatus}</strong>
          {location.lat && (
            <span className="block text-xs mt-1">
              (Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)})
            </span>
          )}
        </div>

        <button
          type="submit"
          className={`w-full text-white p-2 rounded font-bold ${
            location.lat ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!location.lat}
        >
          Post Now
        </button>
      </form>
    </div>
  );
};

export default CreatePost;