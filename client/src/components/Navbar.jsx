import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Code, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Code className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">
            Code<span className="text-blue-600">Arena</span>
          </span>
            </Link>
            
            <div className="flex items-center space-x-4">
            {isAuthenticated ? (
                <>
                <Link 
                    to="/dashboard" 
                    className="px-4 py-2 bg-primary-100 text-primary-700 rounded-md shadow hover:shadow-glow transition duration-400"
                >
                Dashboard
                </Link>

            <div className="flex items-center px-3 py-1 bg-primary-50 text-primary-800 rounded-full shadow-inner space-x-2">
                <User className="h-5 w-5" />
                <span className="font-medium">{user?.username}</span>
            </div>

              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-md hover:shadow-glow-red transition duration-400"
                >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
                </button>

            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;