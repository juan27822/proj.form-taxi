const express = require('express');
const router = express.Router();
const {
    getAllBookings,
    getBookingStatusById,
    searchBookings,
    createBooking,
    confirmBooking,
    cancelBooking,
    updateBooking,
    requestInfo
} = require('../controllers/booking.controller');
const { validateBooking, authenticateToken } = require('../middleware');

router.get('/', authenticateToken, getAllBookings);
router.get('/search', authenticateToken, searchBookings);
router.get('/status/:id', getBookingStatusById); // Public route
router.post('/', validateBooking, createBooking);
router.post('/:id/confirm', authenticateToken, confirmBooking);
router.post('/:id/cancel', authenticateToken, cancelBooking);
router.put('/:id', authenticateToken, validateBooking, updateBooking);
router.post('/:id/request-info', authenticateToken, requestInfo);

module.exports = router;