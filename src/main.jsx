import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { AuthProvider } from './contexts/authContext'; // Import AuthProvider
import './index.css'

createRoot(document.getElementById('root')).render(
 <StrictMode>
 <BrowserRouter>
 <AuthProvider>
 <App />
 </AuthProvider>
 </BrowserRouter>
  </StrictMode>,
)
