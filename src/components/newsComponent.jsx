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
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
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
    <div>
      <h2>Error</h2>
      <p>{error}</p>
      <p>Please check the console for more details and ensure the Ballerina service is running correctly.</p>
    </div>
  );

  const categorizeNews = (articles) => {
    const categories = {
      'Conflict Updates': [],
      'Humanitarian Aid': [],
      'Ceasefire Efforts': [],
      'Civilian Impact': [],
      'International Response': []
    };

    articles.forEach(article => {
      const lowerText = article.text.toLowerCase();
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

  return (
    <div>
      <h1>WarAID: Israel-Hamas Conflict Updates</h1>
      {Object.entries(categorizedNews).map(([category, articles]) => (
        <div key={category}>
          <h2>{category}</h2>
          {articles.length === 0 ? (
            <p>No news articles found for this category.</p>
          ) : (
            articles.map((item, index) => (
              <div key={index} style={{border: '1px solid #ddd', margin: '10px 0', padding: '10px'}}>
                <h3>{item.title}</h3>
                <p>{new Date(item.publish_date).toLocaleDateString()} | Source: {item.source}</p>
                <p>{item.text.substring(0, 200)}...</p>
                <p>Sentiment: {item.sentiment.toFixed(2)} ({item.sentiment > 0 ? 'Positive' : item.sentiment < 0 ? 'Negative' : 'Neutral'})</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer">Read more</a>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
};

export default NewsComponent;