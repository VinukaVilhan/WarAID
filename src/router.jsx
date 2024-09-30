import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatBot from './pages/chatBotPage';
import Home from './pages/homePage';
import AudioTranscriptionPage from './pages/audioTransciptionPage';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ChatBot" element={<ChatBot />} />
        <Route path="/AudioTranscription" element={<AudioTranscriptionPage />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
