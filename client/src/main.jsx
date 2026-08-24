import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './components/LanguageContext.jsx';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'Mukta, sans-serif',
              fontWeight: 600,
              fontSize: '15px',
              borderRadius: '16px',
              padding: '12px 20px',
            },
          }}
        />
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
