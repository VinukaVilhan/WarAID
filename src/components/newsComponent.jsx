import React, { useState, useEffect } from 'react';

const NewsComponent = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:8080/news');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNews(data.news || []);
      } catch (e) {
        setError(e.message || 'Failed to fetch news');
        console.error('Error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return (
    <div className="error-message" style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '5px' }}>
      <h3>Error</h3>
      <p>{error}</p>
      <p>Please check your API key and ensure it's correctly set in the Ballerina service.</p>
    </div>
  );

  return (
    <div className="news-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
      {news.map((item, index) => (
        <div key={index} className="news-card" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
          <div className="news-header">
            <h3 style={{ margin: '0 0 10px 0' }}>{item.title}</h3>
            <p style={{ color: '#666', fontSize: '0.9em' }}>
              {new Date(item.publish_date).toLocaleDateString()} | Author: {item.author || 'Unknown'}
            </p>
          </div>
          <div className="news-content" style={{ margin: '10px 0' }}>
            <p>{item.text.substring(0, 150)}...</p>
            <p style={{ fontStyle: 'italic' }}>Sentiment: {item.sentiment}</p>
          </div>
          <div className="news-footer">
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'none' }}>
              Read more
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsComponent;