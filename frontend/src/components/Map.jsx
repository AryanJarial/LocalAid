import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import '../utils/mapIcons'; 

const Map = ({ posts, userLocation }) => {
  const center = userLocation ? [userLocation.lat, userLocation.lng] : [28.6139, 77.2090];

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden shadow-md mb-6 border border-gray-200 z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {userLocation && (
           <Marker position={[userLocation.lat, userLocation.lng]}>
             <Popup>
               <strong>You are here</strong>
             </Popup>
           </Marker>
        )}

        {posts.map((post) => (
          <Marker 
            key={post._id} 
            position={[post.location.coordinates[1], post.location.coordinates[0]]} 
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
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;