import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/podcastly/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
