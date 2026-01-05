// frontend/src/components/TrendBanner.jsx
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const TrendBanner = ({ userLocation }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchTrends = async () => {
      if (!userLocation) return;
      
      try {
        let url = `/api/posts/trends?lat=${userLocation.lat}&lng=${userLocation.lng}`;
        
        if (user) {
          url += `&excludeId=${user._id}`; // <--- 4. Append ID
        }

        const { data } = await axios.get(url);
        setSummary(data.summary);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchTrends();
  }, [userLocation, user]); // Re-run if location changes

  if (loading) return null; // Don't show anything while loading
  if (!summary || summary.includes("No recent activity")) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-md mb-6 flex items-start gap-3 animate-fade-in">
      <div>
        <h3 className="font-bold text-sm uppercase tracking-wider opacity-90">Community Pulse</h3>
        <p className="font-medium text-lg leading-tight mt-1">
          {summary}
        </p>
      </div>
    </div>
  );
};

export default TrendBanner;