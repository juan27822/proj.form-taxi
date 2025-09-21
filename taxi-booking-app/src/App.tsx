import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientPage from './pages/ClientPage';
import AdminPage from './pages/AdminPage';
import CheckBookingPage from './pages/CheckBookingPage';
import ChartsPage from './components/ChartsPage'; // Import ChartsPage
import './index.css'; // Keep global styles

const App: React.FC = () => {

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js')
        .then(swReg => {
          console.log('Service Worker is registered', swReg);
          return swReg.pushManager.getSubscription()
            .then(subscription => {
              if (subscription === null) {
                // Create a new subscription
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    swReg.pushManager.subscribe({
                      userVisibleOnly: true,
                      applicationServerKey: 'BDSaCdhrYAXlr95bUXsRNsz72dDhCOrQEtAjohUGC2xNFG_40wmFAS3C2esh4iRoI6PvllsNPxNSmiByqcUNfU4' // Your VAPID public key
                    })
                    .then(newSubscription => {
                      console.log('New subscription', newSubscription);
                      fetch('http://localhost:3001/api/subscribe', {
                        method: 'POST',
                        body: JSON.stringify(newSubscription),
                        headers: {
                          'Content-Type': 'application/json'
                        }
                      });
                    });
                  }
                });
              } else {
                // We have a subscription
                console.log('Existing subscription', subscription);
              }
            });
        })
        .catch(error => {
          console.error('Service Worker Error', error);
        });
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClientPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/check-booking" element={<CheckBookingPage />} />
        <Route path="/charts" element={<ChartsPage />} /> {/* Add new route for ChartsPage */}
      </Routes>
    </Router>
  );
};

export default App;