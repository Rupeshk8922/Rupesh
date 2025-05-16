import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext.jsx'; // Import AuthProvider
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
        <App />
  </StrictMode>,
)
// PWA Service Worker Registration
// This is a placeholder for where service worker registration code would typically go.
// In a production environment, you would likely use a build tool like Workbox
// to generate and manage your service worker for features like offline caching
// and push notifications.

// Example (uncomment and adapt when implementing PWA features):
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/service-worker.js') // Replace with your service worker file path
//     .then(registration => console.log('Service Worker registered: ', registration))
//     .catch(registrationError => console.log('Service Worker registration failed: ', registrationError));
// }
