const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getPhoneOriginDistribution = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            select: {
                phone: true,
            },
        });

        const originCounts = {};
        bookings.forEach(booking => {
            if (booking.phone && booking.phone.length >= 3) {
                // Use the first 3 digits as a simple "origin" identifier
                const origin = booking.phone.substring(0, 3);
                originCounts[origin] = (originCounts[origin] || 0) + 1;
            }
        });

        const data = Object.keys(originCounts).map(origin => ({
            origin: origin,
            count: originCounts[origin],
        }));

        res.json(data);
    } catch (error) {
        console.error("Error en getPhoneOriginDistribution:", error);
        res.status(500).json({ message: "Error al obtener la distribución de origen de teléfonos" });
    }
};

const getRoundtripVsOneway = async (req, res) => {
    try {
        const totalBookings = await prisma.booking.count();
        const roundtripBookings = await prisma.booking.count({
            where: {
                return_date: {
                    not: null,
                },
            },
        });

        const onewayBookings = totalBookings - roundtripBookings;

        const data = [
            { type: 'Roundtrip', count: roundtripBookings },
            { type: 'Oneway', count: onewayBookings },
        ];

        res.json(data);
    } catch (error) {
        console.error("Error en getRoundtripVsOneway:", error);
        res.status(500).json({ message: "Error al obtener datos de ida y vuelta" });
    }
};

const getDashboardBookingsByPeriod = async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        const bookings = await prisma.booking.findMany({
            select: {
                receivedAt: true,
                return_date: true, // Select return_date to differentiate
            },
        });

        const groupedBookings = bookings.reduce((acc, booking) => {
            const date = new Date(booking.receivedAt);
            let key;

            if (period === 'day') {
                key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            } else if (period === 'week') {
                const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                const dayNum = d.getUTCDay() || 7;
                d.setUTCDate(d.getUTCDate() + 4 - dayNum);
                const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
                const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                key = `${date.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
            } else { // Default to month
                key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            }

            // Initialize if key doesn't exist
            if (!acc[key]) {
                acc[key] = { oneWay: 0, roundTrip: 0 };
            }

            // Increment count based on return_date
            if (booking.return_date) {
                acc[key].roundTrip += 1;
            } else {
                acc[key].oneWay += 1;
            }
            
            return acc;
        }, {});

        const data = Object.keys(groupedBookings).map(key => ({
            period: key,
            oneWay: groupedBookings[key].oneWay,
            roundTrip: groupedBookings[key].roundTrip,
        })).sort((a, b) => {
            if (a.period < b.period) return -1;
            if (a.period > b.period) return 1;
            return 0;
        });

        res.json(data);
    } catch (error) {
        console.error("Error in getDashboardBookingsByPeriod:", error);
        res.status(500).json({ message: "Error al obtener reservas por período" });
    }
};

const getDashboardPopularDestinations = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        const popularDestinations = await prisma.booking.groupBy({
            by: ['destination'],
            _count: {
                destination: true,
            },
            orderBy: {
                _count: {
                    destination: 'desc',
                },
            },
            take: limit,
        });

        const data = popularDestinations.map(item => ({
            destination: item.destination,
            count: item._count.destination,
        }));

        res.json(data);
    } catch (error) {
        console.error("Error en getDashboardPopularDestinations:", error);
        res.status(500).json({ message: "Error al obtener destinos populares" });
    }
};

const getBookingsByHour = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            select: {
                arrival_time: true, // We only need the arrival time
            },
        });

        // Initialize an array for 24 hours with 0 count
        const hourCounts = Array.from({ length: 24 }, (_, i) => ({
            hour: `${i.toString().padStart(2, '0')}:00`,
            count: 0,
        }));

        bookings.forEach(booking => {
            if (booking.arrival_time) {
                try {
                    const hour = parseInt(booking.arrival_time.split(':')[0], 10);
                    if (!isNaN(hour) && hour >= 0 && hour < 24) {
                        hourCounts[hour].count++;
                    }
                } catch (e) {
                    console.error(`Invalid time format for booking: ${booking.arrival_time}`);
                }
            }
        });

        res.json(hourCounts);
    } catch (error) {
        console.error("Error in getBookingsByHour:", error);
        res.status(500).json({ message: "Error al obtener reservas por hora" });
    }
};

module.exports = {
    getPhoneOriginDistribution,
    getRoundtripVsOneway,
    getDashboardBookingsByPeriod,
    getDashboardPopularDestinations,
    getBookingsByHour
};
