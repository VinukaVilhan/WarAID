import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatBot from './pages/chatBotPage';
import Home from './pages/homePage';
import DocumentationToolPage from './pages/DocumentationToolPage';
import NewsPage from './pages/newsPage';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ChatBot" element={<ChatBot />} />
        <Route path="/Documentation" element={<DocumentationToolPage />} />
        <Route path="/News" element={<NewsPage />}/>
        
      </Routes>
    </Router>
  );
}

export default AppRouter;
