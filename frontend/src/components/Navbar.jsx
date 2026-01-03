import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-blue-600 p-4 text-white shadow-md">
        <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">LocalAid</Link>
            <div>
                {user ? (
                    <>
                    <Link 
                        to="/create-post" 
                        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded mr-4 font-bold text-sm"
                    >
                        + Create Post
                    </Link>
                    <span className="mr-4">Hello, {user.name}</span>
                    <button
                        onClick={logout} 
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm"
                    >
                        Logout
                    </button>
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