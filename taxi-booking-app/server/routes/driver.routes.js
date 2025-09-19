const express = require('express');
const router = express.Router();
const {
    getAllDrivers,
    createDriver,
    updateDriver,
    deleteDriver
} = require('../controllers/driver.controller');
const { authenticateToken } = require('../middleware');

// All driver routes should be protected
router.use(authenticateToken);

router.get('/', getAllDrivers);
router.post('/', createDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

module.exports = router;