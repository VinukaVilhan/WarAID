import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatBot from './pages/chatBot';
import Home from './pages/home';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/ChatBot" element={<ChatBot />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
