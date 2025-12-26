import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ArticleCard from './components/ArticleCard';
import { FaBolt } from 'react-icons/fa';

// URL Config (Dynamic for Production)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/articles';

import ArticleModal from './components/ArticleModal';

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(API_URL);
        // Laravel API Resource returns { data: [...] }
        setArticles(response.data.data);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to connect to the BeyondChats API.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-purple-200 selection:text-purple-900">

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-lg text-white">
              <FaBolt className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ContentForge</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">BeyondChats Scraper</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {articles.length} Articles Loaded
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 animate-pulse">Fetching latest articles...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">
                  {error}
                </p>
                <p className="text-xs text-red-500 mt-1">Make sure the Laravel backend is running on port 8000.</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
              <div key={article.id} onClick={() => setSelectedArticle(article)} className="cursor-pointer h-full">
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-400 text-lg">No articles found in the database.</p>
          </div>
        )}

      </main>

      {/* Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}

export default App;
