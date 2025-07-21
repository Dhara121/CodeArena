import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiSearch, FiEdit2, FiEye, FiX, FiCode, FiUser, FiMail, FiCopy, FiCheck } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/users/profile');
        setProfile(data);
        setFiltered(data.savedCodes);
      } catch (err) {
        console.error('Error fetching profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (!term) return setFiltered(profile.savedCodes);
    const filteredCodes = profile.savedCodes.filter((code) =>
      code.title.toLowerCase().includes(term.toLowerCase())
    );
    setFiltered(filteredCodes);
  };

  const handleCopyCode = async (code, codeId) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(codeId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      python: 'bg-blue-100 text-blue-800 border-blue-200',
      java: 'bg-red-100 text-red-800 border-red-200',
      cpp: 'bg-purple-100 text-purple-800 border-purple-200',
      html: 'bg-orange-100 text-orange-800 border-orange-200',
      css: 'bg-pink-100 text-pink-800 border-pink-200',
      react: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      default: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[language.toLowerCase()] || colors.default;
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-full shadow-lg">
              <FiUser className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome, {profile.user.username}
              </h1>
              <div className="flex items-center text-gray-600">
                <FiMail className="w-4 h-4 mr-2" />
                <span className="text-lg">{profile.user.email}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
                <p className="text-sm text-indigo-600 font-medium">Total Codes</p>
                <p className="text-2xl font-bold text-indigo-800">{profile.savedCodes.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Codes Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <FiCode className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Saved Codes ({profile.savedCodes.length})
                </h2>
              </div>
              
              {/* Search Bar */}
              <div className="relative max-w-md w-full">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search saved codes..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFiltered(profile.savedCodes);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Codes Grid */}
          <div className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCode className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {searchTerm ? 'No codes found' : 'No saved codes yet'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? `No codes match "${searchTerm}". Try a different search term.`
                    : 'Start coding and save your first code snippet!'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((code) => (
                  <div
                    key={code._id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-indigo-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {code.title}
                      </h3>
                    </div>
                    
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getLanguageColor(code.language)}`}>
                        {code.language.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                          title="View code"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                          title="Edit code"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleCopyCode(code.code, code._id)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                        title="Copy code"
                      >
                        {copiedId === code._id ? (
                          <>
                            <FiCheck className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <FiCopy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;