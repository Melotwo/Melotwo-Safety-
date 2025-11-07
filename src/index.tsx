import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Corrected path to App.tsx inside the src directory.
import App from './src/App.tsx';
import './src/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
