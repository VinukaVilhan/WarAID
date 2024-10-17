import React, { useState, useEffect } from "react";
import { RotateCw, AlertOctagon, ExternalLink } from "lucide-react";

const categorizeNews = (articles) => {
    return {
        "All News": articles,
        "Conflict Updates": articles.filter(
            (article) =>
                article.title.match(
                    /conflict|war|battle|fighting|combat|clash|violence|military/i
                ) ||
                article.description.match(
                    /conflict|war|battle|fighting|combat|clash|violence|military/i
                )
        ),
        "Humanitarian Aid": articles.filter(
            (article) =>
                article.title.match(
                    /aid|relief|humanitarian|support|assistance|help|recovery|rescue/i
                ) ||
                article.description.match(
                    /aid|relief|humanitarian|support|assistance|help|recovery|rescue/i
                )
        ),
        "Ceasefire Efforts": articles.filter(
            (article) =>
                article.title.match(
                    /ceasefire|truce|peace|negotiation|peace talks|diplomacy|mediation|agreement/i
                ) ||
                article.description.match(
                    /ceasefire|truce|peace|negotiation|peace talks|diplomacy|mediation|agreement/i
                )
        ),
        "Civilian Impact": articles.filter(
            (article) =>
                article.title.match(
                    /civilian|casualty|displacement|refugee|non-combatant|victims|population|affected|harm/i
                ) ||
                article.description.match(
                    /civilian|casualty|displacement|refugee|non-combatant|victims|population|affected|harm/i
                )
        ),
        "International Response": articles.filter(
            (article) =>
                article.title.match(
                    /international|UN|United Nations|NATO|global|foreign|sanctions|diplomacy|coalition|allies/i
                ) ||
                article.description.match(
                    /international|UN|United Nations|NATO|global|foreign|sanctions|diplomacy|coalition|allies/i
                )
        ),
    };
};

const useFetchNews = (url) => {
    const [news, setNews] = useState({});
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
            const categorizedNews = categorizeNews(data.articles || []);
            setNews(categorizedNews);
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

const NewsItem = ({ article, isLarge = false }) => (
    <div
        className={`bg-white rounded-lg shadow-lg overflow-hidden ${
            isLarge ? "col-span-5" : ""
        }`}
    >
        {article.urlToImage && (
            <div
                className={`bg-cover bg-center ${isLarge ? "h-72" : "h-40"}`}
                style={{ backgroundImage: `url(${article.urlToImage})` }}
            />
        )}
        <div className="p-4">
            <a
                href={article.url}
                target="_blank"
                className="text-xs text-indigo-600 uppercase font-medium hover:text-gray-900 transition duration-500 ease-in-out"
            >
                {article.source.name}
            </a>
            <a
                href={article.url}
                target="_blank"
                className={`block text-gray-900 font-bold ${
                    isLarge ? "text-2xl" : "text-lg"
                } mb-2 hover:text-indigo-600 transition duration-500 ease-in-out`}
            >
                {article.title}
            </a>
            {isLarge && (
                <p className="text-gray-700 text-base mt-2">
                    {article.description}
                </p>
            )}
            <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mt-2"
            >
                Read more
                <ExternalLink className="h-4 w-4 ml-1" />
            </a>
        </div>
    </div>
);

const NewsGrid = () => {
    const [category, setCategory] = useState("All News");
    const { news, loading, error, fetchNews } = useFetchNews(
        "http://localhost:8060/news"
    );

    const categories = Object.keys(news);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RotateCw className="animate-spin h-12 w-12 text-blue-600" />
                <p className="ml-4 text-xl font-medium text-gray-700">
                    Loading latest updates...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md"
                role="alert"
            >
                <div className="flex items-center mb-3">
                    <AlertOctagon className="h-8 w-8 mr-3 text-red-600" />
                    <p className="font-bold text-xl">Unable to load news</p>
                </div>
                <p className="mb-4 text-lg">{error}</p>
                <button
                    onClick={fetchNews}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 text-lg"
                >
                    Retry
                </button>
            </div>
        );
    }

    const mainArticle = news[category]?.[0];
    const sideArticles = news[category]?.slice(1, 7);

    return (
        <div className="max-w-screen-xl mx-auto p-5 sm:p-10 md:p-16">
            <div className="mb-5">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-6 py-3 mr-3 mb-3 font-semibold rounded-lg shadow-md transition-transform duration-200 transform ${
                            category === cat
                                ? "bg-blue-600 text-white shadow-lg scale-105"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        } hover:shadow-lg hover:bg-blue-700 hover:text-white`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                {mainArticle && (
                    <div className="sm:col-span-5">
                        <NewsItem article={mainArticle} isLarge={true} />
                    </div>
                )}
                <div className="sm:col-span-7 grid grid-cols-2 lg:grid-cols-3 gap-5">
                    {sideArticles?.map((article, index) => (
                        <NewsItem key={index} article={article} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsGrid;
