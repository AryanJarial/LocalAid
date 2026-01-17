import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const TrendBanner = ({ userLocation }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchTrends = async () => {
      if (!userLocation) return;
      
      try {
        let url = `/api/posts/trends?lat=${userLocation.lat}&lng=${userLocation.lng}&dist=10`;
        
        if (user) {
            url += `&excludeId=${user._id}`;
        }

        const response = await axios.get(url);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Trend Error:", error);
        setLoading(false);
      }
    };

    fetchTrends();
  }, [userLocation, user]);

  if (loading) return null;

  if (!data) return null;

  const hasActivity = (data.mostNeeded || data.mostOffered) || 
                      (data.summary && !data.summary.includes("No recent activity"));

  const displaySummary = hasActivity 
    ? data.summary 
    : "It's quiet in your area today. Be the first to post a request or offer!";

  return (
    <div className={`rounded-2xl shadow-xl p-6 mb-8 text-white relative overflow-hidden transform hover:scale-[1.01] transition-transform duration-300 ${
        hasActivity 
        ? "bg-gradient-to-r from-indigo-600 to-purple-600" 
        : "bg-gradient-to-r from-teal-500 to-emerald-500"  
    }`}>
        
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white opacity-10 blur-xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
                <span className="text-3xl bg-white/20 p-2 rounded-lg shadow-inner">
                    {hasActivity ? "🔥" : "🌱"}
                </span>
                <div>
                    <h2 className="font-bold text-lg md:text-xl">
                        {hasActivity ? "Community Pulse" : "Quiet Area"}
                    </h2>
                    <p className="text-white/90 text-sm font-medium leading-snug max-w-md">
                        {displaySummary}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
                
                {hasActivity && (
                    <>
                        {data.mostNeeded && (
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg flex items-center gap-2">
                                <span className="text-red-200 font-bold text-xs uppercase tracking-wider">Requested</span>
                                <span className="font-bold text-white capitalize">{data.mostNeeded}</span>
                            </div>
                        )}

                        {data.mostOffered && (
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg flex items-center gap-2">
                                <span className="text-green-200 font-bold text-xs uppercase tracking-wider">Offered</span>
                                <span className="font-bold text-white capitalize">{data.mostOffered}</span>
                            </div>
                        )}
                    </>
                )}

                {!hasActivity && (
                     <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-lg animate-pulse">
                        <span className="text-white font-bold text-sm">Start the chain +</span>
                     </div>
                )}

            </div>

        </div>
    </div>
  );
};

export default TrendBanner;