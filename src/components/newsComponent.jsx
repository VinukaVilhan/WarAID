import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const NewsComponent = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/news');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      const data = await response.json();
      setNews(data.articles || []);
    } catch (e) {
      setError(e.message || 'Failed to fetch news');
      console.error('Error:', e);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
        <p className="ml-2 text-lg">Loading news...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 mr-2" />
          <p className="font-bold">Error</p>
        </div>
        <p>{error}</p>
        <p className="mt-2">Please check the console for more details and ensure the Ballerina service is running correctly.</p>
        <button 
          onClick={fetchNews} 
          className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">WarAID: Israel-Hamas Conflict Updates</h1>
      {Object.entries(categorizedNews).map(([category, articles]) => (
        <div key={category} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{category}</h2>
          {articles.length === 0 ? (
            <p className="text-gray-600">No news articles found for this category.</p>
          ) : (
            articles.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(item.publishedAt).toLocaleDateString()} | Source: {item.source.name}
                </p>
                <p className="mb-2">{item.description}</p>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  Read more
                </a>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
};

export default NewsComponent;