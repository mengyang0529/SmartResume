import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { ErrorBoundary } from '@shared/components/ErrorBoundary';
import './assets/styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
        <Analytics />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
