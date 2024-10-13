import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';

import perplexityLogo from './assets/perplexity.png';



const DummyIcon = ({ color, letter, size = 1 }) => (
  <svg className={`w-${size} h-${size}`} viewBox={`0 0 ${size} ${size}`}>
    <rect width={size} height={size} fill={color} rx={size / 6} />
    {letter && (
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="white"
        fontSize={size * 0.6}
        fontWeight="bold"
      >
        {letter}
      </text>
    )}
  </svg>
);

const ThumbnailIcon = ({ thumbnail }) => (
  <img src={`${thumbnail}`} alt="thumbnail" className="w-8 h-8 rounded-md" />
);

const SearchResult = ({ icon, title, shortcut, isSelected, onClick }) => (
  <div
    className={`flex items-center p-2 cursor-pointer ${isSelected ? 'bg-pink-500 text-white' : 'hover:bg-gray-100'}`}
    onClick={onClick}
  >
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">
      {icon}
    </div>
    <span className="flex-grow ml-3">{title}</span>
    {shortcut && <span className={`text-sm ${isSelected ? 'text-pink-200' : 'text-gray-500'}`}>{shortcut}</span>}
  </div>
);

const KeyboardKey = ({ children }) => (
  <span className="inline-block px-2 py-0 bg-white text-gray-700 font-mono text-sm rounded border border-gray-300 shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
    {children}
  </span>
);

const NavigationInfo = () => (
  <div className="flex justify-center items-center space-x-4 py-2 bg-gray-100">
    <div className="flex items-center space-x-2">
      <KeyboardKey>↑</KeyboardKey>
      <KeyboardKey>↓</KeyboardKey>
      <span className="text-sm text-gray-600">to navigate</span>
    </div>
    <div className="flex items-center space-x-2">
      <KeyboardKey>↵</KeyboardKey>
      <span className="text-sm text-gray-600">to open</span>
    </div>
    <div className="flex items-center space-x-2">
      <KeyboardKey>tab</KeyboardKey>
      <span className="text-sm text-gray-600">to select or for options</span>
    </div>
    <div className="flex items-center space-x-2">
      <KeyboardKey>Esc</KeyboardKey>
      <span className="text-sm text-gray-600">to close</span>
    </div>
  </div>
);

const formatFileSize = (size) => {
  if (size < 1024) return `${size} bytes`;
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  else if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  else return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const openFile = async (filePath) => {
  try {
    const result = await window.electron.ipcRenderer.invoke('open-file', filePath);
    if (result.success) {
      console.log('File opened successfully');
    } else {
      console.error('Failed to open file:', result.error);
    }
  } catch (error) {
    console.error('Error invoking open-file IPC:', error);
  }
};

const SearchInterface = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const resultsRef = useRef(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/search?q=${searchTerm}`);
        setSearchResults(response.data.results);
        console.log('Search results:', response.data.results);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    if (searchTerm) {
      fetchSearchResults();
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        setSelectedIndex((prevIndex) => (prevIndex + 1) % searchResults.length);
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex((prevIndex) => (prevIndex - 1 + searchResults.length) % searchResults.length);
      } else if (e.key === 'Enter') {
        openFile(searchResults[selectedIndex].path);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchResults, selectedIndex]);

  useEffect(() => {
    const selectedElement = resultsRef.current?.children[selectedIndex];
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <div className="h-screen w-screen max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 border-r border-gray-200 flex flex-col">
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pr-10 pl-4 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                placeholder=">"
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 flex-1 overflow-y-auto no-scrollbar" ref={resultsRef}>
            {Array.isArray(searchResults) && searchResults.map((result, index) => (
              <SearchResult
                key={index}
                icon={result.thumbnail ? <ThumbnailIcon thumbnail={result.thumbnail} /> : <DummyIcon color="#5C2D91" letter={result.filename.charAt(0).toUpperCase()} />}
                title={result.filename}
                shortcut={formatFileSize(result.size)}
                isSelected={index === selectedIndex}
                onClick={() => setSelectedIndex(index)}
              />
            ))}
            <div
              className={`flex items-center p-2 cursor-pointer bg-purple-600 text-white`}
              onClick={()=>{}}
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-200">
                <img src={perplexityLogo} alt="Perplexity Logo" className="w-6 h-6" />
              </div>
              <span className="flex-grow ml-3">Search With Perplexity</span>
            </div>
          </div>
        </div>
        <div className="w-1/3 p-6 flex flex-col items-center justify-center">
          {searchResults != null && searchResults.length > 0 && searchResults[selectedIndex] && (
            <>
              {searchResults[selectedIndex].thumbnail ? (
                <ThumbnailIcon thumbnail={searchResults[selectedIndex].thumbnail} />
              ) : (
                <DummyIcon
                  color="#5C2D91"
                  letter={searchResults[selectedIndex].filename.charAt(0).toUpperCase()}
                  size={16}
                />
              )}
              <h2 className="mt-4 text-xl font-semibold text-center">
                {searchResults[selectedIndex].filename}
              </h2>
              <p className="text-sm text-gray-600">
                Similarity: {(searchResults[selectedIndex].similarity * 100).toFixed(2)}%
              </p>
            </>
          )}
        </div>
      </div>
      <NavigationInfo />
    </div>
  );
};

export default SearchInterface;