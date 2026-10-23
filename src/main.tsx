import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA installability and offline support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ KONEKTA PWA Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.warn('⚠️ PWA Service Worker registration error:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
