const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

// --- Nodemailer Configuration ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

let io;
let t;
let sendNotification;

const setSocketIO = (socketIO) => {
    io = socketIO;
};

const setTranslator = (translator) => {
    t = translator;
};

const setNotificationSender = (sender) => {
    sendNotification = sender;
};

const getAllBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const skip = (page - 1) * pageSize;

        const [bookings, totalBookings] = await prisma.$transaction([
            prisma.booking.findMany({
                skip: skip,
                take: pageSize,
                orderBy: {
                    receivedAt: 'desc'
                },
                include: { driver: true } // Include driver data
            }),
            prisma.booking.count()
        ]);

        res.json({
            bookings,
            total: totalBookings,
            page,
            pageSize,
            totalPages: Math.ceil(totalBookings / pageSize)
        });
    } catch (error) {
        console.error("Error reading database:", error);
        res.status(500).json({ message: "Error reading from database" });
    }
};

const getBookingStatusById = async (req, res) => {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                status: true
            }
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json(booking);
    } catch (error) {
        console.error("Error fetching booking status:", error);
        res.status(500).json({ message: "Error fetching booking status" });
    }
};

const searchBookings = async (req, res) => {
    const { name, arrival_date, destination, status, id } = req.query;

    const filters = {};
    if (name) {
        filters.name = {
            contains: name,
        };
    }
    if (arrival_date) {
        filters.arrival_date = {
            startsWith: arrival_date
        };
    }
    if (destination) {
        filters.destination = {
            contains: destination,
        };
    }
    if (status) {
        filters.status = status;
    }
    if (id) {
        filters.id = {
            contains: id
        };
    }

    try {
        const bookings = await prisma.booking.findMany({
            where: filters,
            orderBy: {
                receivedAt: 'desc'
            },
            include: { driver: true } // Include driver data
        });
        res.json(bookings);
    } catch (error) {
        console.error("Error searching bookings:", error);
        res.status(500).json({ message: "Error searching bookings" });
    }
};

const createBooking = async (req, res) => {
    try {
        const customId = nanoid(8);

        const newBooking = await prisma.booking.create({
            data: { ...req.body, id: customId }
        });
        io.emit('newBooking', newBooking); // Notify all connected clients

        // Send push notification
        if (sendNotification) {
            const payload = {
                title: 'New Booking Created',
                body: `Booking #${newBooking.id} has been created.`,
            };
            sendNotification(payload);
        }

        res.status(201).json(newBooking);
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Error creating booking" });
    }
};

const confirmBooking = async (req, res) => {
    try {
        const booking = await prisma.booking.update({
            where: { id: req.params.id },
            data: { status: 'confirmed' },
            include: { driver: true }, // Include driver data
        });

        const lang = booking.lang || 'es'; // Default to Spanish

        // Send push notification
        if (sendNotification) {
            const payload = {
                title: 'Booking Confirmed',
                body: `Booking #${booking.id} has been confirmed.`,
            };
            sendNotification(payload);
        }

        // Send confirmation email
        const details = {
          [t(lang, 'booking_id_label')]: booking.id,
          [t(lang, 'name_label')]: booking.name,
          [t(lang, 'phone_label')]: booking.phone,
          [t(lang, 'email_label')]: booking.email,
          [t(lang, 'people_label')]: booking.people,
          [t(lang, 'has_minors_label')]: booking.hasMinors ? t(lang, 'yes') : t(lang, 'no'),
          [t(lang, 'minors_age_label')]: booking.minorsAge,
          [t(lang, 'needs_baby_seat_label')]: booking.needsBabySeat ? t(lang, 'yes') : t(lang, 'no'),
          [t(lang, 'needs_booster_label')]: booking.needsBooster ? t(lang, 'yes') : t(lang, 'no'),
          [t(lang, 'luggage_type_label')]: booking.luggageType,
          [t(lang, 'arrival_date_label')]: booking.arrival_date,
          [t(lang, 'arrival_time_label')]: booking.arrival_time,
          [t(lang, 'arrival_flight_label')]: booking.arrival_flight_number,
          [t(lang, 'destination_label')]: booking.destination,
          [t(lang, 'return_date_label')]: booking.return_date,
          [t(lang, 'return_time_label')]: booking.return_time,
          [t(lang, 'return_flight_time_label')]: booking.return_flight_time,
          [t(lang, 'return_pickup_label')]: booking.return_pickup_address,
          [t(lang, 'return_flight_label')]: booking.return_flight_number,
          [t(lang, 'additional_info')]: booking.additional_info,
          [t(lang, 'is_modification_label')]: booking.isModification ? t(lang, 'yes') : t(lang, 'no'),
          [t(lang, 'original_booking_id_label')]: booking.originalBookingId
        };

        // Add driver info if available
        if (booking.driver) {
            details[t(lang, 'driver_name_label')] = booking.driver.name;
            details[t(lang, 'driver_phone_label')] = booking.driver.phone;
        }

        let detailsHtml = '<ul>';
        for (const [key, value] of Object.entries(details)) {
          if (value !== undefined && value !== null && value !== '') {
            detailsHtml += `<li><b>${key}:</b> ${value}</li>`;
          }
        }
        detailsHtml += '</ul>';

        const emailHtml = `
          <h1>${t(lang, 'email_title')}</h1>
          <p>${t(lang, 'email_greeting', { name: booking.name })}</p>
          <p>${t(lang, 'email_body_intro')}</p>
          <p><b>${t(lang, 'email_details_header')}</b></p>
          ${detailsHtml}
          <p>${t(lang, 'email_body_outro')}</p>
          <p>${t(lang, 'email_farewell')}</p>
        `;

        const info = await transporter.sendMail({
            from: '"Your Taxi Service" <noreply@yourcompany.com>',
            to: booking.email,
            subject: t(lang, 'email_subject'),
            html: emailHtml
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.json({ message: 'Booking confirmed and email sent', booking });
    } catch (error) {
        console.error("Error in confirmation process:", error);
        res.status(500).json({ message: 'Booking status updated, but failed to send email.', error: error.message });
    }
};




const cancelBooking = async (req, res) => {
    try {
        const booking = await prisma.booking.update({
            where: { id: req.params.id },
            data: { status: 'cancelled' }
        });

        // Send push notification
        if (sendNotification) {
            const payload = {
                title: 'Booking Cancelled',
                body: `Booking #${booking.id} has been cancelled.`,
            };
            sendNotification(payload);
        }

        res.json({ message: 'Booking cancelled', booking });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: "Error cancelling booking" });
    }
};

const updateBooking = async (req, res) => {
    try {
        // --- 1. Get the original booking before updating ---
        const originalBooking = await prisma.booking.findUnique({
            where: { id: req.params.id },
            include: { driver: true }, // Also include driver here
        });

        if (!originalBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // --- 2. Sanitize and prepare the update data ---
        const {
            name, phone, email, people, hasMinors, minorsAge, needsBabySeat,
            needsBooster, luggageType, arrival_date, arrival_time,
            arrival_flight_number, destination, return_date, return_time,
            return_flight_time, return_pickup_address, return_flight_number,
            additional_info, isModification, originalBookingId, driverId
        } = req.body;

        const parsedPeople = parseInt(people, 10);

        const updatedBookingData = {
            name, phone, email,
            people: isNaN(parsedPeople) ? undefined : parsedPeople,
            hasMinors, minorsAge, needsBabySeat, needsBooster, luggageType,
            arrival_date, arrival_time, arrival_flight_number, destination,
            return_date, return_time, return_flight_time, return_pickup_address,
            return_flight_number, additional_info, isModification,
            originalBookingId,
            lang: req.body.lang, // Get lang directly from body
            driverId: driverId === '' ? null : driverId,
        };

        // Remove undefined fields to avoid overwriting with null
        Object.keys(updatedBookingData).forEach(key => {
            if (updatedBookingData[key] === undefined) {
                delete updatedBookingData[key];
            }
        });

        // --- 3. Update the booking ---
        const updatedBooking = await prisma.booking.update({
            where: { id: req.params.id },
            data: updatedBookingData,
            include: { driver: true }, // Return booking with driver
        });

        const lang = updatedBooking.lang || 'es';

        // Send push notification
        if (sendNotification) {
            const payload = {
                title: 'Booking Updated',
                body: `Booking #${updatedBooking.id} has been updated.`,
            };
            sendNotification(payload);
        }

        // --- 4. Compare and build the HTML for the email ---
        const bookingFieldLabels = {
            name: t(lang, 'name_label'),
            phone: t(lang, 'phone_label'),
            email: t(lang, 'email_label'),
            people: t(lang, 'people_label'),
            hasMinors: t(lang, 'has_minors_label'),
            minorsAge: t(lang, 'minors_age_label'),
            needsBabySeat: t(lang, 'needs_baby_seat_label'),
            needsBooster: t(lang, 'needs_booster_label'),
            luggageType: t(lang, 'luggage_type_label'),
            arrival_date: t(lang, 'arrival_date_label'),
            arrival_time: t(lang, 'arrival_time_label'),
            arrival_flight_number: t(lang, 'arrival_flight_label'),
            destination: t(lang, 'destination_label'),
            return_date: t(lang, 'return_date_label'),
            return_time: t(lang, 'return_time_label'),
            return_flight_time: t(lang, 'return_flight_time_label'),
            return_pickup_address: t(lang, 'return_pickup_label'),
            return_flight_number: t(lang, 'return_flight_label'),
            additional_info: t(lang, 'additional_info'),
            driverId: t(lang, 'driver_name_label'), // Add driver
        };

        let detailsHtml = '<ul>';
        for (const key of Object.keys(bookingFieldLabels)) {
            const originalValue = originalBooking[key];
            let updatedValue = updatedBooking[key];
            const label = bookingFieldLabels[key];

            // Special handling for driver
            if (key === 'driverId') {
                const originalDriver = originalBooking.driver;
                const updatedDriver = updatedBooking.driver;

                const originalDriverName = originalDriver ? originalDriver.name : 'N/A';
                const updatedDriverName = updatedDriver ? updatedDriver.name : 'N/A';

                if (originalDriverName !== updatedDriverName) {
                    detailsHtml += `<li style="background-color: #ffecb3;"><b>${label}:</b> ${updatedDriverName} (<i>${t(lang, 'previously')}: ${originalDriverName}</i>)</li>`;
                } else {
                    detailsHtml += `<li><b>${label}:</b> ${updatedDriverName}</li>`;
                }
                continue; // Skip to next iteration
            }


            const formatValue = (val) => {
                if (typeof val === 'boolean') return val ? t(lang, 'yes') : t(lang, 'no');
                return val || 'N/A';
            };

            const originalFormatted = formatValue(originalValue);
            const updatedFormatted = formatValue(updatedValue);

            if (String(originalValue) !== String(updatedValue)) {
                detailsHtml += `<li style="background-color: #ffecb3;"><b>${label}:</b> ${updatedFormatted} (<i>${t(lang, 'previously')}: ${originalFormatted}</i>)</li>`;
            } else {
                detailsHtml += `<li><b>${label}:</b> ${updatedFormatted}</li>`;
            }
        }
         // Add driver phone if driver is assigned
        if (updatedBooking.driver) {
            detailsHtml += `<li><b>${t(lang, 'driver_phone_label')}:</b> ${updatedBooking.driver.phone}</li>`;
        }

        detailsHtml += '</ul>';

        // --- 5. Send the email with the highlighted changes ---
        const emailHtml = `
          <h1>${t(lang, 'email_update_title')}</h1>
          <p>${t(lang, 'email_greeting', { name: updatedBooking.name })}</p>
          <p>${t(lang, 'email_update_body_intro')}</p>
          <p><b>${t(lang, 'email_details_header')}</b></p>
          ${detailsHtml}
          <p>${t(lang, 'email_update_body_outro')}</p>
          <p>${t(lang, 'email_farewell')}</p>
        `;

        await transporter.sendMail({
            from: '"Your Taxi Service" <noreply@yourcompany.com>',
            to: updatedBooking.email,
            subject: t(lang, 'email_update_subject'),
            html: emailHtml
        });

        res.json({ message: 'Booking updated successfully', booking: updatedBooking });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ message: "Error updating booking" });
    }
};

const requestInfo = async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ message: "Message is required" });
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: req.params.id }
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (!booking.email) {
            return res.status(400).json({ message: "Client does not have an email address on file." });
        }

        const lang = booking.lang || 'es'; // Default to Spanish

        const emailHtml = `
          <h1>${t(lang, 'email_query_title')}</h1>
          <p>${t(lang, 'email_greeting', { name: booking.name })}</p>
          <p>${t(lang, 'email_query_body_intro', { id: booking.id })}</p>
          <blockquote>
            <p>${message}</p>
          </blockquote>
          <p>${t(lang, 'email_farewell')}</p>
        `;

        await transporter.sendMail({
            from: '"Your Taxi Service" <noreply@yourcompany.com>',
            to: booking.email,
            subject: t(lang, 'email_query_subject', { id: booking.id }),
            html: emailHtml
        });

        res.json({ message: 'Query email sent successfully' });
    } catch (error) {
        console.error("Error sending query email:", error);
        res.status(500).json({ message: 'Failed to send query email.', error: error.message });
    }
};

module.exports = {
    setSocketIO,
    setTranslator,
    setNotificationSender,
    getAllBookings,
    getBookingStatusById,
    searchBookings,
    createBooking,
    confirmBooking,
    cancelBooking,
    updateBooking,
    requestInfo
};