import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import History from './History.jsx';
import Dashboard from './Dashboard.jsx';
import About from './About.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <Router>
    <Routes>
      <Route path="/" element={<App />}></Route>
      <Route path="/history/" element={<History />}></Route>
      <Route path="/dashboard/:id" element={<Dashboard />}></Route>
      <Route path="/about" element={<About />}></Route>
    </Routes>
  </Router>
  </StrictMode>
)
