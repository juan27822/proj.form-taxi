import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './i18n'; // Initialize i18next
import { io } from 'socket.io-client';

import { registerSW } from 'virtual:pwa-register';

const socket = io('http://localhost:3001'); // Connect to your backend

socket.on('flightAlarm', (data) => {
  console.log('Flight alarm received:', data.message);
  const audio = new Audio('/alarm.mp3'); // Path to your alarm sound file in the public folder
  audio.play().catch(e => console.error("Error playing audio:", e));
});

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
