import React, { useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import axios from 'axios';

const Dashboard = () => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Write your code here');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [languages, setLanguages] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedCodes, setSavedCodes] = useState([]);
  const [showSavedCodes, setShowSavedCodes] = useState(false);

  const fetchLanguages = async () => {
    try {
      const { data } = await axios.get('/api/code/languages');
      setLanguages(data.languages || []);
    } catch (err) {
      console.error('Error fetching languages', err);
    }
  };

  const fetchSavedCodes = async () => {
    try {
      const { data } = await axios.get('/api/code/saved');
      setSavedCodes(data);
    } catch (err) {
      console.error('Error fetching saved codes', err);
    }
  };

  useEffect(() => {
    fetchLanguages();
    fetchSavedCodes();
  }, []);

  useEffect(() => {
    if (showSaveDialog) document.getElementById('save-title')?.focus();
  }, [showSaveDialog]);

  const executeCode = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    try {
      const { data } = await axios.post('/api/code/execute', { language, code, input });
      setOutput(data.result.output);
    } catch (err) {
      setOutput('Error running code');
    }
    setIsExecuting(false);
  };

  const saveCode = async () => {
    if (!saveTitle.trim()) return;
    try {
      await axios.post('/api/code/save', { title: saveTitle, language, code });
      fetchSavedCodes();
      setShowSaveDialog(false);
      setSaveTitle('');
    } catch (err) {
      console.error('Error saving code', err);
    }
  };

  const loadCode = (saved) => {
    setCode(saved.code);
    setLanguage(saved.language);
  };

  const deleteCode = async (id) => {
    if (!window.confirm('Delete this code?')) return;
    try {
      await axios.delete(`/api/code/${id}`);
      fetchSavedCodes();
    } catch (err) {
      console.error('Error deleting code', err);
    }
  };

  const handleDownload = () => {
    const extMap = { javascript: 'js', python: 'py', cpp: 'cpp', java: 'java' };
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-${Date.now()}.${extMap[language] || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex bg-white text-black font-mono overflow-hidden">
      {/* Left Panel - Editor */}
      <div className="w-2/3 p-4 flex flex-col border-r border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border border-gray-400 px-3 py-1 rounded shadow-sm bg-white text-black"
          >
            {languages.length === 0 ? (
              <option disabled>Loading languages...</option>
            ) : (
              languages.map((lang) => (
                <option key={lang.key} value={lang.key}>
                  {lang.name}
                </option>
              ))
            )}
          </select>

          <div className="space-x-2">
            <button
              onClick={executeCode}
              disabled={isExecuting}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded shadow"
            >
              {isExecuting ? 'Running...' : 'Run'}
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded shadow"
            >
              Save
            </button>
            <button
              onClick={handleDownload}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded shadow"
            >
              Download
            </button>
          </div>
        </div>

        <div className="flex-1 border rounded shadow overflow-hidden">
          <MonacoEditor
            height="100%"
            language={language}
            theme="vs-light"
            value={code}
            onChange={(newCode) => setCode(newCode)}
            options={{
              fontSize: 14,
              automaticLayout: true,
              suggestOnTriggerCharacters: true,
              tabSize: 2,
              minimap: { enabled: false }
            }}
          />
        </div>
      </div>

      {/* Right Panel - Input / Output */}
      <div className="w-1/3 p-4 flex flex-col space-y-4 bg-gray-50">
        <div>
          <h3 className="text-sm font-bold mb-1">STDIN</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter input..."
            className="w-full h-24 p-2 border border-gray-300 rounded resize-none bg-white"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-bold mb-1">STDOUT</h3>
          <textarea
            value={output}
            readOnly
            className="w-full h-full p-2 border border-gray-300 rounded resize-none bg-gray-100 text-green-700"
          />
        </div>

        <button
          onClick={() => setShowSavedCodes(!showSavedCodes)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white py-1 rounded shadow"
        >
          {showSavedCodes ? 'Hide Saved Codes' : 'Show Saved Codes'}
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-white p-4 border border-gray-300 rounded shadow-lg w-96 z-50">
          <h2 className="text-lg mb-2 font-semibold">Save Code</h2>
          <input
            id="save-title"
            type="text"
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            placeholder="Enter title"
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          <div className="flex justify-end space-x-2">
            <button onClick={saveCode} className="bg-blue-500 text-white px-4 py-1 rounded shadow">
              Save
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="text-red-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Saved Codes */}
      {showSavedCodes && (
        <div className="absolute top-24 right-4 bg-white p-4 border border-gray-300 rounded shadow-lg w-80 z-40">
          <h2 className="text-lg mb-2 font-bold">Saved Codes</h2>
          {savedCodes.map((sc) => (
            <div key={sc._id} className="border-b border-gray-200 py-2 flex justify-between items-center">
              <div>
                <strong>{sc.title}</strong>
                <span className="text-sm text-gray-500 ml-1">({sc.language})</span>
              </div>
              <div className="space-x-2 text-sm">
                <button onClick={() => loadCode(sc)} className="text-blue-500 hover:underline">
                  Load
                </button>
                <button onClick={() => deleteCode(sc._id)} className="text-red-500 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
