import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './i18n'; // Initialize i18next
// Comentado para evitar el error de PWA por ahora
// import { registerSW } from 'virtual:pwa-register';

/* Comentado para evitar el error de PWA por ahora
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}
*/

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
