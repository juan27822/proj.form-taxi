const express = require('express');
const router = express.Router();
const {
    getPhoneOriginDistribution,
    getRoundtripVsOneway,
    getDashboardBookingsByPeriod,
    getDashboardPopularDestinations,
    getBookingsByHour
} = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware');

// Todas las rutas del dashboard requerirán autenticación
router.use(authenticateToken);

router.get('/phone-origin-distribution', getPhoneOriginDistribution);
router.get('/roundtrip-vs-oneway', getRoundtripVsOneway);
router.get('/bookings-by-period', getDashboardBookingsByPeriod);
router.get('/popular-destinations', getDashboardPopularDestinations);
router.get('/bookings-by-hour', getBookingsByHour);

module.exports = router;
