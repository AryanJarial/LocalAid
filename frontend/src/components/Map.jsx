import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet CSS is imported

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const RecenterController = ({ center, trigger }) => {
  const map = useMap();

  useEffect(() => {
    if (trigger > 0) {
      map.flyTo(center, 13, {
        animate: true,
        duration: 1.5 
      });
    }
  }, [trigger, center, map]);

  return null;
};

const Map = ({ posts, userLocation }) => {
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  const center = userLocation ? [userLocation.lat, userLocation.lng] : [28.6139, 77.2090];

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden shadow-md mb-6 border border-gray-200 z-0 relative group">
      
      {userLocation && (
        <button 
          type="button"
          onClick={() => setRecenterTrigger(prev => prev + 1)}
          className="absolute top-2 right-2 z-[1000] bg-white p-2 rounded shadow-md hover:bg-gray-100 border border-gray-300 text-gray-700 transition-all"
          title="Return to my location"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <circle cx="12" cy="12" r="10"></circle>
             <line x1="22" y1="12" x2="18" y2="12"></line>
             <line x1="6" y1="12" x2="2" y2="12"></line>
             <line x1="12" y1="6" x2="12" y2="2"></line>
             <line x1="12" y1="22" x2="12" y2="18"></line>
             <circle cx="12" cy="12" r="2"></circle>
          </svg>
        </button>
      )}

      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <RecenterController center={center} trigger={recenterTrigger} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User Location Marker (Blue) */}
        {userLocation && (
           <Marker 
             position={[userLocation.lat, userLocation.lng]}
             icon={defaultIcon} 
           >
             <Popup>
               <strong>You are here</strong>
             </Popup>
           </Marker>
        )}

        {/* Render Posts (Filtered & Color Coded) */}
        {posts
          // 2. FILTER: Remove completed posts from the map
          .filter(post => post.status !== 'fulfilled')
          .map((post) => {
            // 3. COLOR LOGIC: Request=Red, Offer=Green
            const icon = post.type === 'request' ? redIcon : greenIcon;

            return (
              <Marker 
                key={post._id} 
                position={[post.location.coordinates[1], post.location.coordinates[0]]} 
                icon={icon} 
              >
                <Popup>
                  <div className="text-center">
                    <strong className="block text-sm">{post.title}</strong>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                       post.type === 'request' ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'
                    }`}>
                      {post.type}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{post.category}</p>
                  </div>
                </Popup>
              </Marker>
            );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;