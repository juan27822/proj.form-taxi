const Joi = require('joi');
const jwt = require('jsonwebtoken');

const bookingSchema = Joi.object({
    id: Joi.string().optional(),
    receivedAt: Joi.string().optional(),
    status: Joi.string().optional(),
    name: Joi.string().min(3).required(),
    phone: Joi.string().required(),
    email: Joi.string().email().optional(),
    people: Joi.number().integer().min(1).required(),
    hasMinors: Joi.boolean().optional(),
        minorsAge: Joi.string().allow('', null).optional(),
    needsBabySeat: Joi.boolean().optional(),
    needsBooster: Joi.boolean().optional(),
    luggageType: Joi.string().allow('', null).optional(),
    arrival_date: Joi.string().required(),
    arrival_time: Joi.string().required(),
    arrival_flight_number: Joi.string().allow('', null).optional(),
    destination: Joi.string().required(),
    return_date: Joi.string().allow('', null).optional(),
    return_time: Joi.string().allow('', null).optional(),
    return_flight_time: Joi.string().allow('', null).optional(),
    return_pickup_address: Joi.string().allow('', null).optional(),
    return_flight_number: Joi.string().allow('', null).optional(),
    additional_info: Joi.string().allow('', null).optional(),
    isModification: Joi.boolean().optional(),
    originalBookingId: Joi.string().allow('', null).optional(),
    lang: Joi.string().optional(),
    driverId: Joi.string().allow('', null).optional()
});

const userSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}'))
});

const validateBooking = (req, res, next) => {
    const { error, value } = bookingSchema.validate(req.body, { stripUnknown: true });
    if (error) {
        console.error("Joi validation error in validateBooking:", error.details);
        return res.status(400).json({ message: error.details[0].message, details: error.details });
    }
    req.body = value; // Assign the cleaned value back to req.body
    next();
};

const validateUser = (req, res, next) => {
    if (req.body.username) {
        req.body.username = req.body.username.trim();
    }
    const { error } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Auth Header:', authHeader); // Added log
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Token:', token); // Added log
    if (token == null) {
        console.log('No token provided, sending 401'); // Added log
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification failed, sending 403. Error:', err.message); // Added log
            return res.sendStatus(403);
        }
        req.user = user;
        console.log('Token verified, user:', user); // Added log
        next();
    });
};

module.exports = {
    validateBooking,
    validateUser,
    authenticateToken
};