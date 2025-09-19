import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientPage from './pages/ClientPage';
import AdminPage from './pages/AdminPage';
import CheckBookingPage from './pages/CheckBookingPage';
import ChartsPage from './components/ChartsPage'; // Import ChartsPage
import './index.css'; // Keep global styles

const App: React.FC = () => {
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