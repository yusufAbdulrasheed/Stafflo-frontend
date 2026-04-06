import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster position="top-right" toastOptions={{ duration: 3500, style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13.5px', borderRadius: '10px' } }} />
    </AuthProvider>
  </BrowserRouter>
);
