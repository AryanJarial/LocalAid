import { useState,useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, CheckCircle, ArrowRight, Smartphone, Globe } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext); 
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/'); 
    } else {
      setError(result.message); 
    }
  };

  return (
    <div className="w-full h-screen grid md:grid-cols-2 overflow-hidden">
      
      {/* --- LEFT SIDE: FORM (Uses exact CreatePost styling) --- */}
      {/* pt-28 ensures Navbar doesn't cover content */}
      <div className="bg-white flex flex-col justify-center px-8 md:px-16 pt-28 pb-8 relative animate-fade-in-up overflow-y-auto">
        
        <div className="max-w-lg mx-auto w-full">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-8 bg-purple-600 rounded"></div>
                    <span className="font-bold text-gray-800 text-xl">LocalAid</span>
                </div>
                
                <h2 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-gray-500">Sign in to continue supporting your community.</p>
            </div>
            
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-lg text-sm font-medium flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    {error}
                </div>
            )}

            {/* FORM - Using CreatePost Input Styles */}
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Input */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                             <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            className="w-full pl-12 p-4 border-2 border-gray-100 bg-gray-50 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-50 focus:outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-gray-700 font-bold text-sm uppercase tracking-wide">Password</label>
                        {/* <a href="#" className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline">Forgot password?</a> */}
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                             <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            className="w-full pl-12 p-4 border-2 border-gray-100 bg-gray-50 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-50 focus:outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Submit Button - Exact Gradient from CreatePost */}
                <button
                    type="submit"
                    className="w-full text-white p-4 rounded-xl font-bold text-lg transition-all transform flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-[1.02] shadow-lg hover:shadow-purple-500/30 mt-4"
                >
                    Sign In <ArrowRight className="w-5 h-5" />
                </button>

            </form>

            <div className="mt-8 text-center border-t border-gray-100 pt-6">
                <p className="text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-purple-600 font-bold hover:underline">
                        Create free account
                    </Link>
                </p>
            </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: IMAGE (Full Height) --- */}
      <div className="hidden md:block relative h-full bg-gray-100">
           {/* Background Image */}
           <img 
               src="/Login.png" 
               alt="Community Help" 
               className="w-full h-full object-cover"
           />
           
           {/* Overlay - Gradient from CreatePost style */}
           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-12 pt-32 text-white">
                <div className="max-w-xl">
                    <div className="w-16 h-1 bg-purple-400 mb-6 rounded-full"></div>
                    <h3 className="text-4xl font-bold mb-4 leading-tight">Together we are stronger.</h3>
                    <p className="text-white/80 text-lg font-medium leading-relaxed">
                        Your small help can mean the world to someone nearby. Join the network of kindness today.
                    </p>
                </div>
           </div>
      </div>

    </div>
  );
};

export default Login;