const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all drivers
const getAllDrivers = async (req, res) => {
    try {
        const drivers = await prisma.driver.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        res.json(drivers);
    } catch (error) {
        console.error("Error fetching drivers:", error);
        res.status(500).json({ message: "Error fetching drivers" });
    }
};

// Create a new driver
const createDriver = async (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) {
        return res.status(400).json({ message: "Name and phone are required" });
    }

    try {
        const newDriver = await prisma.driver.create({
            data: { name, phone }
        });
        res.status(201).json(newDriver);
    } catch (error) {
        console.error("Error creating driver:", error);
        res.status(500).json({ message: "Error creating driver" });
    }
};

// Update a driver
const updateDriver = async (req, res) => {
    const { id } = req.params;
    const { name, phone } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ message: "Name and phone are required" });
    }

    try {
        const updatedDriver = await prisma.driver.update({
            where: { id },
            data: { name, phone }
        });
        res.json(updatedDriver);
    } catch (error) {
        console.error(`Error updating driver ${id}:`, error);
        res.status(500).json({ message: `Error updating driver ${id}` });
    }
};

// Delete a driver
const deleteDriver = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.driver.delete({
            where: { id }
        });
        res.status(204).send(); // No content
    } catch (error) {
        console.error(`Error deleting driver ${id}:`, error);
        res.status(500).json({ message: `Error deleting driver ${id}` });
    }
};

module.exports = {
    getAllDrivers,
    createDriver,
    updateDriver,
    deleteDriver
};