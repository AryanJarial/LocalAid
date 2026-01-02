import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">LocalAid</Link>
        <div>
          <Link to="/login" className="mr-4 hover:underline">Login</Link>
          <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded font-bold hover:bg-gray-100">Register</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;