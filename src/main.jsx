// frontend/src/main.jsx

import React    from 'react';
import ReactDOM from 'react-dom/client';
import App      from './App.jsx';
import './index.css';

// Register PWA service worker
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  // Called when a new version of the app is available
  onNeedRefresh() {
    if (confirm('New version available! Click OK to update.')) {
      updateSW(true);
    }
  },
  // Called when app is ready to work offline
  onOfflineReady() {
    console.log('✅ App is ready to work offline');
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);