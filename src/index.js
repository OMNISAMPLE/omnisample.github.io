import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Export from './Export';
import App from './App';
import { HashRouter as Router, Routes, Route } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/export" element={<Export />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
