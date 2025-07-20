import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Play, Save, Code } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">CodeArena</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A powerful online code editor with real-time execution. Write, run, and share your
            code seamlessly across multiple programming languages.
          </p>
          
          <div className="flex justify-center space-x-4">
            {isAuthenticated ? (
              <Link 
                to="/dashboard"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/register"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
                <Link 
                  to="/login"
                  className="bg-gray-800 text-white px-8 py-3 rounded-lg text-lg hover:bg-gray-900 transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-6">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Execution</h3>
              <p className="text-gray-600">
                Execute your code instantly with support for multiple programming languages including
                JavaScript, Python, Java, C++, and PHP.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-6">
                <Save className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Save & Manage</h3>
              <p className="text-gray-600">
                Save your projects and access them from anywhere. Organize your code with our
                intuitive project management system.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-6">
                <Code className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Monaco Editor</h3>
              <p className="text-gray-600">
                Experience the power of VS Code's Monaco Editor with syntax highlighting, auto-completion,
                and intelligent code suggestions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;