// Enhanced Dashboard with Advanced Monaco Editor & Features
import React, { useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import axios from 'axios';
import { 
  FiSettings, FiSave, FiDownload, FiPlay, FiFolder, FiX, FiEdit2, 
  FiLoader, FiMaximize2, FiMinimize2, FiEye, FiEyeOff, FiCopy,
  FiRefreshCw, FiCode, FiTerminal, FiFileText, FiSun, FiMoon
} from 'react-icons/fi';
import { AiOutlineConsoleSql } from 'react-icons/ai';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { loadTheme } from '../utils/loadMonacoTheme';

const Dashboard = () => {
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [languages, setLanguages] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [savedCodes, setSavedCodes] = useState([]);
  const [showSavedCodes, setShowSavedCodes] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [executionStats, setExecutionStats] = useState(null);
  const [lineWrap, setLineWrap] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('console');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const defaultSnippets = {
    javascript: `// Welcome to the Enhanced Code Editor
console.log("Hello, World!");

// Example: Array methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

// Example: Async function
async function fetchData() {
  return new Promise(resolve => {
    setTimeout(() => resolve("Data loaded!"), 1000);
  });
}

fetchData().then(console.log);`,
    python: `# Welcome to the Enhanced Code Editor
print("Hello, World!")

# Example: List comprehension
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print(f"Doubled: {doubled}")

# Example: Function with type hints
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("Python"))`,
    cpp: `// Welcome to the Enhanced Code Editor
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::cout << "Hello, World!" << std::endl;
    
    // Example: Vector operations
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    std::transform(numbers.begin(), numbers.end(), numbers.begin(), 
                   [](int n) { return n * 2; });
    
    std::cout << "Doubled numbers: ";
    for (const auto& n : numbers) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,
    java: `// Welcome to the Enhanced Code Editor
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Example: Stream operations
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        List<Integer> doubled = numbers.stream()
            .map(n -> n * 2)
            .collect(Collectors.toList());
            
        System.out.println("Doubled: " + doubled);
    }
}`
  };

  useEffect(() => {
    fetchLanguages();
    fetchSavedCodes();
  }, []);

  useEffect(() => {
    setCode(defaultSnippets[language] || '// Write your code here');

    const languageThemeMap = {
      javascript: 'monokai',
      python: 'vs-light',
      cpp: 'hc-black',
      java: 'vs-dark'
    };
    setTheme(languageThemeMap[language] || 'vs-dark');
  }, [language]);

  useEffect(() => {
    if (theme === 'monokai') {
      loadTheme().then(() => {
        monaco.editor.setTheme('monokai');
      });
    } else {
      monaco.editor.setTheme(theme);
    }
  }, [theme]);

  const fetchLanguages = async () => {
    try {
      const { data } = await axios.get('/api/code/languages');
      setLanguages(data.languages || [
        { key: 'javascript', name: 'JavaScript' },
        { key: 'python', name: 'Python' },
        { key: 'cpp', name: 'C++' },
        { key: 'java', name: 'Java' }
      ]);
    } catch (err) {
      console.error('Error fetching languages', err);
    }
  };

  const fetchSavedCodes = async () => {
    try {
      const { data } = await axios.get('/api/code/saved');
      setSavedCodes(data.codes || []);
    } catch (err) {
      console.error('Error fetching saved codes', err);
    }
  };

  const executeCode = async () => {
    setIsExecuting(true);
    setOutput('Running code...\n');
    
    try {
      const start = performance.now();
      const { data } = await axios.post('/api/code/execute', { language, code, input });
      const end = performance.now();
      setOutput(data.result.output || 'Code executed successfully with no output');
      setExecutionStats({ 
        time: (end - start).toFixed(1) + 'ms', 
        memory: data.result.memory || 'N/A',
        status: data.result.status || 'Success'
      });
    } catch (err) {
      setOutput(`Error: ${err.response?.data?.message || 'Failed to execute code'}`);
      setExecutionStats({ time: '0ms', memory: 'N/A', status: 'Error' });
    }
    setIsExecuting(false);
    setActiveTab('console');
  };

  const saveCode = async () => {
    if (!saveTitle.trim()) return;
    try {
      const fileName = `${saveTitle.replace(/\s+/g, '-')}-${Date.now()}.${language}`;
      await axios.post('/api/code/save', { title: saveTitle, language, code, fileName });
      fetchSavedCodes();
      setSaveTitle('');
      setShowSaveModal(false);
    } catch (err) {
      console.error('Error saving code', err);
    }
  };

  const loadCode = (saved) => {
    setCode(saved.code);
    setLanguage(saved.language);
    setShowSavedCodes(false);
  };

  const deleteCode = async (id) => {
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  const clearOutput = () => {
    setOutput('');
    setExecutionStats(null);
  };

  const themes = [
    { value: 'vs-dark', name: 'Dark', icon: FiMoon },
    { value: 'vs-light', name: 'Light', icon: FiSun },
    { value: 'hc-black', name: 'High Contrast', icon: FiEye },
    { value: 'monokai', name: 'Monokai', icon: FiCode }
  ];

  return (
    <div className={`h-screen w-screen flex flex-col bg-gray-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Enhanced Toolbar */}
      <div className="flex justify-between items-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600 shadow-lg">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <FiCode className="text-blue-400 text-xl" />
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Code Editor 
            </span>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition-colors appearance-none pr-8"
              >
                {languages.map((lang) => (
                  <option key={lang.key} value={lang.key}>{lang.name}</option>
                ))}
              </select>
              <FiFolder className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="flex gap-1">
              {themes.map((t) => {
                const IconComponent = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      theme === t.value 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={t.name}
                  >
                    <IconComponent size={16} />
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-1">
              <button 
                onClick={() => setFontSize(Math.max(10, fontSize - 1))} 
                className="text-sm px-2 py-1 hover:bg-gray-600 rounded transition-colors"
              >
                A-
              </button>
              <span className="text-sm text-gray-300">{fontSize}px</span>
              <button 
                onClick={() => setFontSize(Math.min(24, fontSize + 1))} 
                className="text-sm px-2 py-1 hover:bg-gray-600 rounded transition-colors"
              >
                A+
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setLineWrap(!lineWrap)}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
              lineWrap ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title="Toggle Word Wrap"
          >
            {lineWrap ? <FiEye size={16} /> : <FiEyeOff size={16} />}
            Wrap
          </button>
          
          <button 
            onClick={copyToClipboard}
            className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
            title="Copy Code"
          >
            <FiCopy size={16} />
          </button>
          
          <button 
            onClick={executeCode} 
            disabled={isExecuting}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium disabled:opacity-50 transition-all duration-200 shadow-lg"
          >
            {isExecuting ? <FiLoader className="animate-spin" size={16} /> : <FiPlay size={16} />}
            {isExecuting ? 'Running...' : 'Run Code'}
          </button>
          
          <button 
            onClick={() => setShowSavedCodes(!showSavedCodes)} 
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
              showSavedCodes ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            <FiFileText size={16} />
            Files
          </button>
          
          <button 
            onClick={() => setShowSaveModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
          >
            <FiSave size={16} />
            Save
          </button>
          
          <button 
            onClick={handleDownload} 
            className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-200"
            title="Download"
          >
            <FiDownload size={16} />
          </button>
          
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-200"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 border-r border-gray-600">
            <MonacoEditor
              width="100%"
              height="100%"
              language={language}
              theme={theme}
              value={code}
              onChange={setCode}
              options={{
                fontSize,
                wordWrap: lineWrap ? 'on' : 'off',
                lineNumbers: 'on',
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                contextmenu: true,
                codeLens: true,
                folding: true,
                renderLineHighlight: 'line',
                bracketPairColorization: { enabled: true },
                formatOnPaste: true,
                formatOnType: true,
                automaticLayout: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on'
              }}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-96 flex flex-col bg-gray-800">
          {/* Tabs */}
          <div className="flex border-b border-gray-600">
            <button
              onClick={() => setActiveTab('console')}
              className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'console' 
                  ? 'bg-gray-700 text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              }`}
            >
              <FiTerminal size={16} />
              Console
            </button>
            {showInput && (
              <button
                onClick={() => setActiveTab('input')}
                className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'input' 
                    ? 'bg-gray-700 text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              >
                Input
              </button>
            )}
          </div>

          {/* Console Content */}
          {activeTab === 'console' && (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center px-4 py-2 bg-gray-750 border-b border-gray-600">
                <span className="font-medium text-gray-200">Output</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowInput(!showInput)}
                    className="text-gray-400 hover:text-gray-200 p-1 rounded"
                    title="Toggle Input"
                  >
                    <FiEdit2 size={14} />
                  </button>
                  <button 
                    onClick={clearOutput}
                    className="text-gray-400 hover:text-gray-200 p-1 rounded"
                    title="Clear Output"
                  >
                    <FiRefreshCw size={14} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-auto bg-black text-green-400 font-mono text-sm">
                <pre className="whitespace-pre-wrap">{output || '// Run your code to see output here'}</pre>
                {executionStats && (
                  <div className="mt-4 p-3 bg-gray-900 rounded border-l-4 border-blue-400">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Status: <span className={executionStats.status === 'Success' ? 'text-green-400' : 'text-red-400'}>{executionStats.status}</span></span>
                      <span>Time: {executionStats.time}</span>
                      <span>Memory: {executionStats.memory}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Input Section */}
          {activeTab === 'input' && showInput && (
            <div className="flex-1 flex flex-col">
              <div className="px-4 py-2 bg-gray-750 border-b border-gray-600">
                <span className="font-medium text-gray-200">Program Input</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-4 bg-gray-900 text-gray-200 resize-none focus:outline-none font-mono text-sm"
                placeholder="Enter input for your program here..."
              />
            </div>
          )}
        </div>

        {/* Saved Codes Sidebar */}
        {showSavedCodes && (
          <div className="w-80 bg-gray-800 border-l border-gray-600 flex flex-col">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-600">
              <h3 className="font-bold text-gray-200">Saved Files</h3>
              <button 
                onClick={() => setShowSavedCodes(false)}
                className="text-gray-400 hover:text-gray-200 p-1 rounded"
              >
                <FiX size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {savedCodes.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <FiFileText size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No saved files yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedCodes.map((sc) => (
                    <div key={sc._id} className="bg-gray-700 rounded-lg p-3 hover:bg-gray-650 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-200 truncate">{sc.title}</h4>
                          <p className="text-sm text-gray-400 capitalize">{sc.language}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(sc.createdAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button 
                            onClick={() => loadCode(sc)} 
                            className="text-blue-400 hover:text-blue-300 p-1.5 rounded hover:bg-gray-600 transition-colors"
                            title="Load Code"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button 
                            onClick={() => deleteCode(sc._id)} 
                            className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-gray-600 transition-colors"
                            title="Delete"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-96 border border-gray-600 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-200">Save Code</h3>
            <input
              type="text"
              placeholder="Enter a title for your code..."
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none mb-4"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveCode()}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveCode}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2"
              >
                <FiSave size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;