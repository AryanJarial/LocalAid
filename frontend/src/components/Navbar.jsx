import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-blue-600 p-4 text-white shadow-md z-50 relative">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold">LocalAid</Link>
                <div className="flex items-center">
                    {user ? (
                        <>
                            <Link
                                to="/create-post"
                                className="bg-green-500 hover:bg-green-600 px-3 py-1 sm:px-4 sm:py-2 rounded mr-4 font-bold text-sm"
                            >
                                + Create Post
                            </Link>

                            {/* Link to Profile */}
                            <Link to="/profile" className="mr-4 hover:underline font-semibold flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center mr-2 text-sm">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="hidden sm:inline">{user.name}</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mr-4 hover:underline">Login</Link>
                            <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded font-bold hover:bg-gray-100">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;