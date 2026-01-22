import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { io } from 'socket.io-client';
import logoImage from '/Logo.png';

const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Navbar = () => {
  const { user, updateUser, notification } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState('');

  const navBgClass = user
    ? "bg-white/90 backdrop-blur-md shadow-xl border border-white/20"
    : "bg-gradient-to-r from-blue-600/90 to-indigo-700/90 backdrop-blur-md shadow-2xl border border-white/10";

  const textColorClass = user
    ? "text-gray-700 hover:text-blue-600"
    : "text-white/90 hover:text-white";

  const logoColorClass = user
    ? "text-blue-600"
    : "text-white";


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
    <div className="fixed top-0 left-0 right-0 z-50 p-4">

      <nav className={`${navBgClass} rounded-2xl transition-all duration-300`}>
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center relative">

            {/* --- LEFT: Logo --- */}
            <Link to="/" className="flex items-center space-x-3 group z-20">
              <img
                src={logoImage}
                alt="LocalAid Logo"
                className="h-10 w-10 rounded-full object-cover shadow-sm transform group-hover:scale-110 transition-transform duration-300"
              />
              {/* Hide text on very small screens to prevent overlap with centered messages */}
              <span className={`text-2xl font-bold ${user ? "text-gray-800" : "text-white"} group-hover:opacity-90 transition-colors hidden sm:block`}>
                LocalAid
              </span>
            </Link>

            {/* --- CENTER: Navigation --- */}
            {/* Logic: Absolute Center. Flex container is ALWAYS visible. */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-8 z-10">

              {/* 1. Home (Hidden on mobile, visible on md+) */}
              <Link
                to="/"
                className={`${textColorClass} font-medium transition-colors hidden md:block`}
              >
                Home
              </Link>

              {/* 2. Messages (ALWAYS VISIBLE in the center) */}
              {user && (
                <Link to="/chat" className={`${textColorClass} font-medium transition-colors relative flex items-center gap-1`}>
                  <span>Messages</span>
                  {/* Notification Badge */}
                  {notification.length > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                      {notification.length > 9 ? '9+' : notification.length}
                    </span>
                  )}
                </Link>
              )}

              {/* 3. Explore (Hidden on mobile, visible on md+) */}
              <div
                className="relative hidden md:block"
                onMouseEnter={() => setDropdownOpen('explore')}
                onMouseLeave={() => setDropdownOpen('')}
              >
                <button className={`${textColorClass} font-medium transition-colors flex items-center space-x-1 py-2`}>
                  <span>Explore</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen === 'explore' && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-4 w-48">
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2 animate-fade-in-up overflow-hidden">
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

            {/* --- RIGHT: User Actions --- */}
            <div className="flex items-center space-x-3 md:space-x-4 z-20">
              {user ? (
                <>
                  <span className="hidden lg:inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md cursor-default">
                    ⭐ {user.karmaPoints || 0}
                  </span>

                  <Link
                    to="/create-post"
                    className="inline-flex items-center bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-3 md:px-5 py-2 rounded-full font-bold text-xs md:text-sm shadow-lg transition-all transform hover:scale-105"
                  >
                    <span className="mr-1 text-lg leading-none">+</span>
                    <span className="hidden sm:inline">Create</span>
                  </Link>

                  <Link to="/profile" className="flex items-center space-x-2 group">
                    <div className="relative">
                      <img
                        src={user.profilePicture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow-sm group-hover:border-blue-400 transition-all"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white hover:text-blue-100 font-medium px-4 py-2 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-full font-bold shadow-lg transition-all transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;