import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import './index.css';
import App from './App';
import MainView from './Components/MainView/MainView';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/mainhall" element={<MainView MosqueArea={"Main Hall"}/>} />
        <Route path="/hallway" element={<MainView MosqueArea={"Hallway"}/>} />
        <Route path="/poll" element={<MainView MosqueArea={"Poll"}/>} />
      </Routes>
     </Router> */}
  </React.StrictMode>
);