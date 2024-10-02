import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatBot from './pages/chatBotPage';
import Home from './pages/homePage';
import DocumentationToolPage from './pages/DocumentationToolPage';
import ResourceLocatorPage from './pages/resourceLocatorPage';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ChatBot" element={<ChatBot />} />
        <Route path="/Documentation" element={<DocumentationToolPage />} />
        <Route path='/ResourceLocator' element={<ResourceLocatorPage/>}/>
        
      </Routes>
    </Router>
  );
}

export default AppRouter;
