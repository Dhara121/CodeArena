import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Play, Save, Code, Users } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-display">
      <div className="px-6 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          Welcome to <span className="text-blue-600">CodeArena</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          A powerful online code editor with real-time execution. Write, run, and share your code seamlessly.
        </p>

        <div className="flex justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-gray-800 text-white px-8 py-3 rounded-lg text-lg hover:bg-gray-900 transition"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

          <FeatureCard Icon={Play} color="bg-blue-100" textColor="text-blue-600" title="Real-time Execution" desc="Run your code instantly across popular languages." />
          <FeatureCard Icon={Save} color="bg-green-100" textColor="text-green-600" title="Save & Manage" desc="Organize and access your code anywhere, anytime." />
          <FeatureCard Icon={Code} color="bg-purple-100" textColor="text-purple-600" title="Monaco Editor" desc="Use VS Code's Monaco Editor in the browser." />
          
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ Icon, color, textColor, title, desc }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
    <div className={`flex items-center justify-center w-12 h-12 ${color} rounded-lg mb-4`}>
      <Icon className={`h-6 w-6 ${textColor}`} />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{desc}</p>
  </div>
);

export default Home;