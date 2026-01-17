import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { io } from 'socket.io-client';

const ENDPOINT = "http://localhost:5000";

const Navbar = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState('');

  useEffect(() => {
    if (!user) return;
    const socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("notification", (data) => {
      if (data.newKarma !== undefined) {
        updateUser({ karmaPoints: data.newKarma });
        alert(data.message);
      }
    });
    return () => socket.disconnect();
  }, [user]);

  return (
    <nav className="bg-teal-300 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center relative">
          
          <Link to="/" className="flex items-center space-x-2 group z-10">
            <div className="text-blue-600 text-3xl font-bold transform group-hover:scale-110 transition-transform">
              🤝
            </div>
            <span className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              LocalAid
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </Link>

            {user && (
              <Link 
                to="/chat" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Messages
              </Link>
            )}
            
            <div 
              className="relative"
              onMouseEnter={() => setDropdownOpen('explore')}
              onMouseLeave={() => setDropdownOpen('')}
            >
              <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center space-x-1 py-2">
                <span>Explore</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {dropdownOpen === 'explore' && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-2 w-48">
                  
                  <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-fade-in-up">
                    
                    <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-center">
                      📍 Nearby Posts
                    </Link>
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-center">
                      🗺️ My Activity
                    </Link>

                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 z-10">
            {user ? (
              <>
                <span className="hidden sm:inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md transform hover:scale-105 transition-transform cursor-default">
                  ⭐ {user.karmaPoints || 0}
                </span>

                <Link
                  to="/create-post"
                  className="hidden lg:inline-flex items-center bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg transition-all transform hover:scale-105"
                >
                  <span className="mr-1 text-lg leading-none">+</span> Create
                </Link>

                <Link to="/profile" className="flex items-center space-x-2 group">
                  <div className="relative">
                    <img 
                      src={user.profilePicture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 group-hover:border-blue-500 transition-all"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="hidden md:inline font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {user.name}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 font-medium px-6 py-2 rounded-full border-2 border-transparent hover:border-blue-600 transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;