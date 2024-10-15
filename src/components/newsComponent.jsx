import React, { useState, useEffect, useMemo } from "react";
import {
    AlertOctagon,
    RotateCw,
    ArrowLeftCircle,
    ArrowRightCircle,
    Link,
    ArrowDown,
    ArrowUp,
} from "lucide-react";

// Custom hook for fetching news
const useFetchNews = (url) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setNews(data.articles || []);
        } catch (e) {
            setError(e.message || "Failed to fetch news");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [url]);

    return { news, loading, error, fetchNews };
};

const NewsComponent = () => {
    const { news, loading, error, fetchNews } = useFetchNews(
        "http://localhost:8060/news"
    );
    const [currentIndices, setCurrentIndices] = useState({});
    const [expandedCategory, setExpandedCategory] = useState(null);

    const categorizeNews = (articles) => {
        const categories = {
            "Conflict Updates": [],
            "Humanitarian Aid": [],
            "Ceasefire Efforts": [],
            "Civilian Impact": [],
            "International Response": [],
        };

        articles.forEach((article) => {
            const lowerText = (
                article.description +
                " " +
                article.title
            ).toLowerCase();
            if (
                lowerText.includes("attack") ||
                lowerText.includes("military") ||
                lowerText.includes("strike")
            ) {
                categories["Conflict Updates"].push(article);
            } else if (
                lowerText.includes("aid") ||
                lowerText.includes("humanitarian") ||
                lowerText.includes("relief")
            ) {
                categories["Humanitarian Aid"].push(article);
            } else if (
                lowerText.includes("ceasefire") ||
                lowerText.includes("peace") ||
                lowerText.includes("negotiation")
            ) {
                categories["Ceasefire Efforts"].push(article);
            } else if (
                lowerText.includes("civilian") ||
                lowerText.includes("refugee") ||
                lowerText.includes("casualty")
            ) {
                categories["Civilian Impact"].push(article);
            } else if (
                lowerText.includes("un") ||
                lowerText.includes("united nations") ||
                lowerText.includes("international")
            ) {
                categories["International Response"].push(article);
            }
        });

        return categories;
    };

    const categorizedNews = useMemo(() => categorizeNews(news), [news]);

    useEffect(() => {
        const initialIndices = {};
        Object.keys(categorizedNews).forEach((category) => {
            initialIndices[category] = 0;
        });
        setCurrentIndices(initialIndices);
    }, [news]);

    const navigateNews = (category, direction) => {
        setCurrentIndices((prevIndices) => ({
            ...prevIndices,
            [category]:
                (prevIndices[category] +
                    direction +
                    categorizedNews[category].length) %
                categorizedNews[category].length,
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RotateCw className="animate-spin h-8 w-8 text-gray-600" />
                <p className="ml-2 text-lg font-medium">
                    Loading latest updates...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
                role="alert"
            >
                <div className="flex items-center">
                    <AlertOctagon className="h-6 w-6 mr-2 text-red-600" />
                    <p className="font-bold">Unable to load news</p>
                </div>
                <p className="mt-2">{error}</p>
                <button
                    onClick={fetchNews}
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(categorizedNews).map(([category, articles]) => (
                <div
                    key={category}
                    className="bg-gray-100 rounded-lg shadow-lg overflow-hidden"
                >
                    <div className="bg-gray-800 text-white p-4">
                        <h2 className="text-lg font-semibold flex items-center justify-between">
                            {category}
                            <span className="text-sm bg-gray-600 px-2 py-1 rounded-full">
                                {articles.length}
                            </span>
                        </h2>
                    </div>
                    <div className="p-4">
                        {articles.length === 0 ? (
                            <p className="text-gray-500">
                                No updates available for this category.
                            </p>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={() =>
                                            navigateNews(category, -1)
                                        }
                                        className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors duration-200"
                                        disabled={articles.length <= 1}
                                        aria-label="Previous article"
                                    >
                                        <ArrowLeftCircle className="h-5 w-5 text-gray-800" />
                                    </button>
                                    <span className="text-sm text-gray-500">
                                        {currentIndices[category] + 1} of{" "}
                                        {articles.length}
                                    </span>
                                    <button
                                        onClick={() =>
                                            navigateNews(category, 1)
                                        }
                                        className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors duration-200"
                                        disabled={articles.length <= 1}
                                        aria-label="Next article"
                                    >
                                        <ArrowRightCircle className="h-5 w-5 text-gray-800" />
                                    </button>
                                </div>
                                {articles[currentIndices[category]] && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {
                                                articles[
                                                    currentIndices[category]
                                                ].title
                                            }
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-2">
                                            {new Date(
                                                articles[
                                                    currentIndices[category]
                                                ].publishedAt
                                            ).toLocaleDateString()}{" "}
                                            |{" "}
                                            {
                                                articles[
                                                    currentIndices[category]
                                                ].source.name
                                            }
                                        </p>
                                        <p className="text-gray-700 mb-4">
                                            {
                                                articles[
                                                    currentIndices[category]
                                                ].description
                                            }
                                        </p>
                                        <a
                                            href={
                                                articles[
                                                    currentIndices[category]
                                                ].url
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-gray-800 hover:text-gray-900"
                                        >
                                            Read more
                                            <Link className="h-5 w-5 ml-1" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NewsComponent;
