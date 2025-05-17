jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './contexts/authContext.jsx'; // Verify this path
import { SubscriptionProvider } from './contexts/SubscriptionContext.jsx'; // Verify this path
import './index.css'; // Or your main CSS file

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider> {/* Wrap with SubscriptionProvider */}
          <App />
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
