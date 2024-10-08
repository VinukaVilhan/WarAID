import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatBot from './pages/chatBotPage';
import Home from './pages/homePage';
import DocumentationToolPage from './pages/DocumentationToolPage';
import ResourceLocatorPage from './pages/resourceLocatorPage';
import ManagePage from './pages/manage';
import AdminResourceLocatorPage from './pages/admin/adminResourcePage';
import AdminAlertPage from './pages/admin/adminAlertPage';
import EmergencyContacts from './pages/EmergencyContacts';



function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ChatBot" element={<ChatBot />} />
        <Route path="/Documentation" element={<DocumentationToolPage />} />
        <Route path='/ResourceLocator' element={<ResourceLocatorPage/>}/>
        <Route path="/Manage" element={<ManagePage />} />
        <Route path="/AdminResourceLocator" element={<AdminResourceLocatorPage />} />
        <Route path="/AdminAlert" element={<AdminAlertPage />} />
        <Route path="/EmergencyContacts" element={<EmergencyContacts />} />
        
      </Routes>
    </Router>
  );
}

export default AppRouter;
