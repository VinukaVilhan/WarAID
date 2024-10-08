import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, ChevronLeft, ChevronRight, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const NewsComponent = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndices, setCurrentIndices] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8010/news');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNews(data.articles || []);
    } catch (e) {
      setError(e.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const categorizeNews = (articles) => {
    const categories = {
      'Conflict Updates': [],
      'Humanitarian Aid': [],
      'Ceasefire Efforts': [],
      'Civilian Impact': [],
      'International Response': []
    };

    articles.forEach(article => {
      const lowerText = (article.description + ' ' + article.title).toLowerCase();
      if (lowerText.includes('attack') || lowerText.includes('military') || lowerText.includes('strike')) {
        categories['Conflict Updates'].push(article);
      } else if (lowerText.includes('aid') || lowerText.includes('humanitarian') || lowerText.includes('relief')) {
        categories['Humanitarian Aid'].push(article);
      } else if (lowerText.includes('ceasefire') || lowerText.includes('peace') || lowerText.includes('negotiation')) {
        categories['Ceasefire Efforts'].push(article);
      } else if (lowerText.includes('civilian') || lowerText.includes('refugee') || lowerText.includes('casualty')) {
        categories['Civilian Impact'].push(article);
      } else if (lowerText.includes('un') || lowerText.includes('united nations') || lowerText.includes('international')) {
        categories['International Response'].push(article);
      }
    });

    return categories;
  };

  const categorizedNews = categorizeNews(news);

  useEffect(() => {
    const initialIndices = {};
    Object.keys(categorizedNews).forEach(category => {
      initialIndices[category] = 0;
    });
    setCurrentIndices(initialIndices);
  }, [news]);

  const navigateNews = (category, direction) => {
    setCurrentIndices(prevIndices => ({
      ...prevIndices,
      [category]: (prevIndices[category] + direction + categorizedNews[category].length) % categorizedNews[category].length
    }));
  };

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
        <p className="ml-2 text-lg font-medium">Loading latest updates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 mr-2" />
          <p className="font-bold">Unable to load news</p>
        </div>
        <p className="mt-2">{error}</p>
        <button 
          onClick={fetchNews} 
          className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(categorizedNews).map(([category, articles]) => (
        <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleCategory(category)}
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
          >
            <h2 className="text-xl font-semibold flex items-center">
              {category}
              <span className="ml-2 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                {articles.length}
              </span>
            </h2>
            {expandedCategory === category ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
          </button>
          
          {expandedCategory === category && (
            <div className="p-4">
              {articles.length === 0 ? (
                <p className="text-gray-600">No updates available for this category.</p>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateNews(category, -1)}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                      disabled={articles.length <= 1}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <span className="text-sm text-gray-500">
                      {currentIndices[category] + 1} of {articles.length}
                    </span>
                    <button
                      onClick={() => navigateNews(category, 1)}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                      disabled={articles.length <= 1}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                  {articles[currentIndices[category]] && (
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium">{articles[currentIndices[category]].title}</h3>
                        <a 
                          href={articles[currentIndices[category]].url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-4 text-blue-500 hover:text-blue-700 flex items-center"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(articles[currentIndices[category]].publishedAt).toLocaleDateString()} | {articles[currentIndices[category]].source.name}
                      </p>
                      <p className="text-gray-700">{articles[currentIndices[category]].description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NewsComponent;