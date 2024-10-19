import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/homePage';
import DocumentationToolPage from './pages/DocumentationToolPage';
import ResourceLocatorPage from './pages/resourceLocatorPage';
import ManagePage from './pages/manage';
import AdminResourceLocatorPage from './pages/admin/adminResourcePage';
import AdminAlertPage from './pages/admin/adminAlertPage';
import EmergencyContacts from './pages/EmergencyContacts';
import PrivateRoute from './components/routing/PrivateRouter';

function AppRouter() {
  return (
    <Routes>
      
      <Route path="/" element={<Home />} />
      <Route path="/Documentation" element={<DocumentationToolPage />} />
      <Route path='/ResourceLocator' element={<ResourceLocatorPage/>}/>
      <Route path="/EmergencyContacts" element={<EmergencyContacts />} />
      <Route path="/Manage" element={<PrivateRoute><ManagePage /></PrivateRoute>} />
      <Route path="/AdminResourceLocator" element={<PrivateRoute><AdminResourceLocatorPage /></PrivateRoute>} />
      <Route path="/AdminAlert" element={<PrivateRoute><AdminAlertPage /></PrivateRoute>} />
    </Routes>
  );
}

export default AppRouter;