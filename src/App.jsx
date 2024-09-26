import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './components/Home'
import ChatBot from './components/ChatBot'
import Documentation from './components/Documentation'
import ResourceLocator from './components/ResourceLocator'

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path='/ChatBot' element={<ChatBot/>}/>
        <Route path='/Documentation' element={<Documentation/>}/>
        <Route path='/ResourceLocator' element={<ResourceLocator/>}/>
        
      </Routes>
    </Router>

  )
}

export default App
